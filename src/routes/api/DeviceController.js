import express from "express";
import passport from "passport";
import Device from "../../models/Device";
import { Utils } from "../../utils/utils";
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
  async (req, res) => Utils.performAction(req, res, DeviceController.getDevices)
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
  async (req, res) =>
    Utils.performAction(req, res, DeviceController.isRegistered)
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
  (req, res, next) => Utils.requireKey(req, res, next),
  async (req, res) =>
    await Utils.performAction(req, res, DeviceController.registerDevice)
);

export class DeviceController {
  static errors() {
    return {
      headerMissing: new Error("Client applicaiton key in header is missing")
    };
  }

  static async getDevices(req, res) {
    const { user } = req;
    if (!user) {
      let err = new Error();
      err.message = "No user associated with request.";
      throw err;
    }
    return await findDeviceByClientKey(user.id);
  }
  // TODO: Complete method
  static async isRegistered(req, res) {
    const { client_key } = req.headers;
    const { deviceToken } = req.body;
    if (!deviceToken) {
      let err = new Error();
      err.message = "Device Token is required.";
      throw err;
    }
  }

  static async findDevices() {
    return await Device.find();
  }

  static async findDeviceByClientKey(appId) {
    return await Device.find({
      client_key: await this.lookupApplication(appId)
    });
  }

  static async lookupApplication(appId) {
    return await Application.lookupApp({ _id: appId });
  }

  static async lookupApplicationByClientKey(clientKey) {
    return await Application.lookupApp({ client_key: clientKey });
  }

  static async registerDevice(req, res) {
    if (!req.headers) {
      throw this.errors().headerMissing;
    }
    const { client_application_key } = req.headers;
    if (!client_application_key) {
      throw this.errors().headerMissing;
    }
    let newDevice = new Device(req.body);
    let application = await Application.lookupApp({
      client_key: client_application_key
    });
    if (!application) {
      return res.status(404).json({
        error: `Cannot register device with appllication id: ${client_application_key} as it does not exist. `
      });
    }
    await newDevice.save();
    return { device: newDevice };
  }
}

export const DeviceRouter = router;
