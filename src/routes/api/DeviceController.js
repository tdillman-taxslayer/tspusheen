import express from "express";
import passport from "passport";
import Device from "../../models/Device";
import {
  lookupFullApp,
  initOrReturnFirebaseApp
} from "./NotificationController";
import { requireKey } from "../../utils/utils";
import Application from "../../models/Application";

const router = express.Router();

// Returns all the devices registered with the application
// GET /devices
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => performAction(req, res, getDevices)
);

// determines if the device is registered with the application or not
router.get(
  "/registered",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => performAction(req, res, isRegistered)
);

// registers a device
// POST /devices
router.post(
  "/register",
  requireKey,
  async (req, res) => await performAction(req, res, registerDevice)
);
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const isRegistered = async (req, res) => {
  const { deviceId } = req.query;
  console.log(deviceId);
};

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
  const { client_application_key } = req.headers;
  let newDevice = new Device(req.body);
  let application = await Application.findOne({
    client_key: client_application_key
  }).select({
    client_key: 1,
    secret_key: 1,
    provider_credentials: 1,
    database_url: 1
  });
  if (!application) {
    return res.status(404).json({
      error: `Cannot register device with appllication id: ${client_application_key} as it does not exist. `
    });
  }

  let fb = await initOrReturnFirebaseApp(application, req);
  let registration = await fb.subscribeToTopic(
    newDevice.device_token,
    application.id
  );
  if (registration.errors.length > 0) {
    let newErr = new Error(registration.errors[0].error);
    throw newErr;
  }
  await newDevice.save();
  return { device: newDevice, topics: registration };
};

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const DeviceRouter = router;
