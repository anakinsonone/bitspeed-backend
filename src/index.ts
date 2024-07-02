import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", async (req, res) => {
  const response = "connected";
  res.send(response);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
