import express from "express";
import bcrypt from "bcryptjs";
import cryptoString from "crypto-random-string";
import jwt from "jsonwebtoken";
import passport from "passport";
import Application from "../../models/Application";
import { JWT_SECRET_KEY } from "../../config/config";

const router = express.Router();
// /applications
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => await performAction(req, res, getAll)
);
// /applications
router.post("/", async (req, res) => await performAction(req, res, create));
// /applications/authenticate
router.post(
  "/authenticate",
  async (req, res) => await performAction(req, res, authenticate)
);

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  return await Application.find();
};

const create = async (req, res) => {
  let newApplication = new Application(req.body);
  newApplication.client_key = cryptoString(40);
  let secretKey = cryptoString(40);
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(secretKey, salt);
  newApplication.secret_key = hash;
  return { application: await newApplication.save(), secret: secretKey };
};

const authenticate = async (req, res) => {
  const { id, secretKey } = req.body;
  if (!id) {
    return res.status(400).json({ error: "id parameter required." });
  }
  let application = await Application.findById(id).select("secret_key");
  if (!application) {
    return res
      .status(404)
      .json({ error: `Application with id ${id} does not exist.` });
  }
  let compare = await bcrypt.compare(secretKey, application.secret_key);
  if (!compare) {
    return res.status(403).json({ error: "Invalid secret key." });
  }

  // generate token
  let token = jwt.sign({ id: application.id }, JWT_SECRET_KEY, {
    expiresIn: 3600
  });
  return { token: `Bearer ${token}` };
};

export const ApplicationRouter = router;
