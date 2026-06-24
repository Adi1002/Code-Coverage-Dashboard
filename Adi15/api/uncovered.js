export default async function handler(req, res) {
  try {
    const { repo, filename } = req.query;

    if (!repo || !filename) {
      return res.status(400).json({
        message: "repo and filename are required",
      });
    }

    const url =
      `http://13.127.42.153/codecoverage/dashboard/${repo}/uncovered` +
      `?filename=${filename}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        message: `Backend returned ${response.status}`,
        url,
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}