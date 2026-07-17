from fastapi import FastAPI, HTTPException, Query
import xml.etree.ElementTree as ET
import os
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse
from pathlib import Path
from fastapi import Cookie
from fastapi import Depends
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

env_path = Path(__file__).parent / ".env"

print("ENV PATH =", env_path)
print("ENV EXISTS =", env_path.exists())

load_dotenv(dotenv_path=env_path)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

print("CLIENT_ID =", GOOGLE_CLIENT_ID)

print("REDIRECT_URI =", GOOGLE_REDIRECT_URI)

app = FastAPI()
app.add_middleware(
    SessionMiddleware,
    secret_key="some-random-long-secret-string"
)



oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)

print("OAUTH CLIENT ID =", oauth.google.client_id)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://ec2-13-127-42-153.ap-south-1.compute.amazonaws.com/"
],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials = True,
)

async def verify_user(auth_token: str = Cookie(None)):

    if not auth_token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    try:
        user = id_token.verify_oauth2_token(
            auth_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return user

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

DATASTORE_PATH = "TestResultsDatastore"
VALID_REPOS = ["reports-service", "settings-service", "workflow-service"]


def get_xml_root(repo_name: str, xml_filename: str):
    filepath = os.path.join(DATASTORE_PATH, repo_name, xml_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"{xml_filename} not found for {repo_name}")
    return ET.parse(filepath).getroot()


def validate_repo(repo_name: str):
    if repo_name not in VALID_REPOS:
        raise HTTPException(status_code=404, detail=f"Repo '{repo_name}' not found. Valid: {VALID_REPOS}")


# ─────────────────────────────────────────
# PHASE 1 — Top 4 stat cards
# ─────────────────────────────────────────
@app.get("/codecoverage/dashboard/{repo_name}/summary")
def get_repo_summary(
    repo_name: str,
    user = Depends(verify_user)
):
    validate_repo(repo_name)
    latest = get_xml_root(repo_name, "1.xml")
    previous = get_xml_root(repo_name, "2.xml")

    line_rate_latest     = float(latest.get("line-rate", 0))
    branch_rate_latest   = float(latest.get("branch-rate", 0))
    line_rate_previous   = float(previous.get("line-rate", 0))
    branch_rate_previous = float(previous.get("branch-rate", 0))

    return {
        "line_coverage":         round(line_rate_latest * 100, 1),
        "line_coverage_trend":   round((line_rate_latest - line_rate_previous) * 100, 1),
        "branch_coverage": round(branch_rate_latest * 100, 1),
        "branch_coverage_trend": round((branch_rate_latest - branch_rate_previous) * 100, 1),
        "lines_covered":         int(latest.get("lines-covered", 0)),
        "lines_valid":           int(latest.get("lines-valid", 0)),
        "branches_covered":      int(latest.get("branches-covered", 0)),
        "branches_valid":        int(latest.get("branches-valid", 0)),
    }


# ─────────────────────────────────────────
# PHASE 2 — Package tree with files
# ─────────────────────────────────────────
def insert_into_tree(tree: dict, parts: list, files: list):
    """Recursively insert a package path into the tree"""
    if not parts:
        return

    part = parts[0]
    if part not in tree:
        tree[part] = {"subpackages": {}, "files": []}

    if len(parts) == 1:
        # We're at the final package — add files here
        tree[part]["files"].extend(files)
    else:
        # Go deeper into subpackages
        insert_into_tree(tree[part]["subpackages"], parts[1:], files)


def build_tree_response(tree: dict) -> list:
    """Convert the nested dict into a clean list structure for the response"""
    result = []
    for name, content in tree.items():
        result.append({
            "name":        name,
            "files":       content["files"],
            "subpackages": build_tree_response(content["subpackages"])
        })
    return result


@app.get("/codecoverage/dashboard/{repo_name}/packages")
def get_package_tree(
    repo_name: str,
    user = Depends(verify_user)
):
    validate_repo(repo_name)

    root = get_xml_root(repo_name, "1.xml")
    tree = {}

    for package in root.iter("package"):
        package_name = package.get("name")
        parts        = package_name.split(".")

        # Get all files (classes) in this package
        files = []
        for cls in package.findall(".//class"):
            all_lines     = cls.find("lines").findall("line") if cls.find("lines") is not None else []
            lines_valid   = len(all_lines)
            lines_covered = sum(1 for line in all_lines if int(line.get("hits", 0)) > 0)

            files.append({
                "filename":        cls.get("filename"),
                "line_coverage":   round(float(cls.get("line-rate", 0)) * 100, 1),
                "branch_coverage": round(float(cls.get("branch-rate", 0)) * 100, 1),
                "lines_covered":   lines_covered,
                "lines_valid":     lines_valid,
            })

        insert_into_tree(tree, parts, files)

    return {"repo": repo_name, "packages": build_tree_response(tree)}


# ─────────────────────────────────────────
# PHASE 3 — Uncovered lines for a file
# ─────────────────────────────────────────
@app.get("/codecoverage/dashboard/{repo_name}/uncovered")
def get_uncovered_lines(
    repo_name: str,
    user = Depends(verify_user),
    filename: str = Query(..., description="e.g. reports-service/app.ts")
):
    validate_repo(repo_name)

    root = get_xml_root(repo_name, "1.xml")
    

    for cls in root.iter("class"):
        if cls.get("filename") == filename:
            all_lines       = cls.find("lines").findall("line") if cls.find("lines") is not None else []
            uncovered_lines = [int(line.get("number")) for line in all_lines if int(line.get("hits", 0)) == 0]

            return {
                "repo":            repo_name,
                "filename":        filename,
                "total_lines":     len(all_lines),
                "uncovered_count": len(uncovered_lines),
                "uncovered_lines": uncovered_lines,
            }

    raise HTTPException(status_code=404, detail=f"File '{filename}' not found in {repo_name}")

@app.get("/auth/login")
async def login(request: Request):

    print("LOGIN CLIENT ID =", GOOGLE_CLIENT_ID)
    print("LOGIN REDIRECT URI =", GOOGLE_REDIRECT_URI)

    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI
    )



@app.get("/auth/callback")
async def auth_callback(request: Request):
    print("CHECK CALLBACK", request.query_params)

    token = await oauth.google.authorize_access_token(request)
    
    id_token = token["id_token"]

    response = RedirectResponse(
    url="https://ec2-13-127-42-153.ap-south-1.compute.amazonaws.com/"
)

    response.set_cookie(
    key="auth_token",
    value=id_token,
    httponly=True,
    secure=True,
    samesite="none"
)

    return response

@app.get("/auth/me")
async def me(auth_token: str = Cookie(None)):

    if not auth_token:
        raise HTTPException(status_code=401)

    try:
        user = id_token.verify_oauth2_token(
            auth_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return {
            "authenticated": True,
            "email": user["email"],
            "name": user.get("name")
        }

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
@app.get("/data/repository")
async def data(user=Depends(verify_user)):
    base_path = os.path.join(os.path.dirname(__file__), "TestResultsDatastore")
    if not os.path.exists(base_path):
        logger.error(f"Base path not found: {base_path}")
        raise HTTPException(status_code=404, detail="Data directory not found on server")

    trees = []
    for service in os.listdir(base_path):
        service_path = os.path.join(base_path, service)
        if os.path.isdir(service_path):
            logger.info(f"Processing service: {service}")
            service_trees = []
            for file in os.listdir(service_path):
                if file.endswith(".xml"):
                    file_path = os.path.join(service_path, file)
                    try:
                        parsed = ET.parse(file_path)
                        service_trees.append(parsed)
                        logger.info(f"Successfully parsed: {file}")
                    except ET.ParseError as e:
                        logger.error(f"Failed to parse XML file {file}: {e}")
                        raise HTTPException(status_code=500, detail=f"Failed to parse file: {file}")
            trees.append({"reponame": service, "files": service_trees})

    if not trees:
        logger.warning("No services or XML files found")
        raise HTTPException(status_code=404, detail="No data found in the data directory")

    results = []
    for i, service_trees in enumerate(trees):
        for j, parsed in enumerate(service_trees["files"]):
            try:
                root = parsed.getroot()
                results.append({
                    "service_id": i + 1,
                    "repoName": service_trees["reponame"],
                    "file_number": j + 1,
                    "lines-covered": int(root.get("lines-covered")),
                    "total-lines": int(root.get("lines-valid")),
                    "branches-covered": int(root.get("branches-covered")),
                    "total-branches": int(root.get("branches-valid")),
                    "timestamp": int(root.get("timestamp")),
                })
            except Exception as e:
                logger.error(f"Error extracting data from file {j+1} in service {service_trees['reponame']}: {e}")
                raise HTTPException(status_code=500, detail=f"Error reading data from {service_trees['reponame']}")

    logger.info(f"Successfully returned {len(results)} results")
    return results