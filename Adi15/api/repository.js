export default async function handler(req, res) {
  try {
    const response = await fetch(
      "http://ec2-100-24-9-250.compute-1.amazonaws.com:8000/data/repository"
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}