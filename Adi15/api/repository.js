export default async function handler(req, res) {
  try {
    const response = await fetch(
      'http://ec2-100-24-9-250.compute-1.amazonaws.com/data/repository'
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}