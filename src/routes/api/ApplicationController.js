import * as express from "express";
import Application from "../../models/Application";
import cryptoString from "crypto-random-string";
import { encryptValue } from "../../utils/utils";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await Application.find());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    let newApplication = new Application(req.body);
    newApplication.client_key = cryptoString(40);
    newApplication.secret_key = cryptoString(40);
    res.json(await newApplication.save());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const ApplicationRouter = router;
