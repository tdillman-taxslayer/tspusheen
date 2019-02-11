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

/**
 * @swagger
 * paths:
 *  /devices:
 *    get:
 *      description: "Get all devices registered with application"
 *      responses:
 *        200:
 *          description: Returns array of Devices registered with application
 *          type: array
 *          items:
 *            $ref: "#/definitions/Device"
 *        500:
 *          description: Server encountered an error
 *
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => performAction(req, res, getDevices)
);

/**
 * @swagger
 * paths:
 *  /devices/registered:
 *    post:
 *      description: Determines if the device with device token is registered with the application or not.
 *      parameters:
 *        - name: client_key
 *          description: Application client key
 *          in: header
 *          required: true
 *        - name: body
 *          in: body
 *          required: true
 *          description: "JSON Body"
 *          schema:
 *            type: object
 *            properties:
 *              deviceToken:
 *                type: string
 *                required: true
 *      responses:
 *        200:
 *          description: Returns boolean value indicating if device is registered with application or not.
 *          schema:
 *            type: object
 *            properties:
 *              registered:
 *                type: boolean
 *        500:
 *          description: Server encountered an error
 */
router.post(
  "/registered",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => performAction(req, res, isRegistered)
);

/**
 * @swagger
 * paths:
 *  /devices/register:
 *    post:
 *     description: Register device with application
 *     parameters:
 *     - name: client_key
 *       in: header
 *       required: true
 *       type: string
 *       description: Device Application Client Key used to identify which application the device is registering with
 *     - name: body
 *       in: body
 *       required: true
 *       schema:
 *        $ref: "#/definitions/Device_Create"
 */
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
export const isRegistered = async (req, res) => {
  const { client_key } = req.headers;
  const { deviceToken } = req.body;
  if (!deviceToken) {
    let err = new Error();
    err.message = "Device Token is required.";
    throw err;
  }
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
