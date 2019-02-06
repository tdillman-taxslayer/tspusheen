import express from "express";
import passport from "passport";
import Device from "../../models/Device";
import { lookupFullApp } from "./NotificationController";
import { requireKey } from "../../utils/utils";

const router = express.Router();

// GET /devices
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => performAction(req, res, getDevices)
);
// GET /devices/:deviceId

// Gets list of devices registered to the specific user
// GET /devices/user/:userId

// registers a device
// POST /devices
router.post(
  "/register",
  requireKey,
  async (req, res) => await performAction(req, res, registerDevice)
);

const getDevices = async (req, res) => {
  let application = await lookupFullApp(req.user.id);
  return await Device.find({ client_key: application.client_key });
};

/**
 *
 * @param {Request} req
 * @param {Reponse} res
 */
const registerDevice = async (req, res) => {
  let newDevice = new Device(req.body);
  return await newDevice.save();
};

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const DeviceRouter = router;
