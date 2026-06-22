export default async function handler(req, res) {
  try {
    const response = await fetch(
      "http://ec2-100-24-9-250.compute-1.amazonaws.com/data/repository"
    );

    const text = await response.text();

    return res.status(200).json({
      status: response.status,
      ok: response.ok,
      data: text.substring(0, 1000),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
}