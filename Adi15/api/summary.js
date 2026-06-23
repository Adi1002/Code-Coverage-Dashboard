// api/summary.js

export default async function handler(req, res) {
  try {
    const { service } = req.query;

    const response = await fetch(
      `http://13.127.42.153/codecoverage/dashboard/${service}/summary`
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
