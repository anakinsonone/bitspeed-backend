import { Router } from "express";
import { findContacts } from "../controllers";

export const IdentityRouter = Router();

IdentityRouter.post("/", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "email or phoneNumber is required" });
  }

  const response = await findContacts(req.body);

  return res.status(200).json(response);
});
