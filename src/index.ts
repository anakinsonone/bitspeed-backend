import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { PrismaClient, Contact as PrismaContact } from "@prisma/client";
import { IdentityRouter } from "./routes";

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(bodyParser.json());

app.use("/identify", IdentityRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
