export default async function handler(req, res) {
  try {
    const { repo } = req.query;

    if (!repo) {
      return res.status(400).json({
        message: "repo parameter is required",
      });
    }

    const url =
      `http://13.127.42.153/codecoverage/dashboard/${repo}/spackages`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}