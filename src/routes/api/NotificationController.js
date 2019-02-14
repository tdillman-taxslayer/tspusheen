// controls sending push notifications to specific applications.
import express from "express";
import passport from "passport";
import firebase from "firebase-admin";
import Application from "../../models/Application";
import Device from "../../models/Device";
import { FirebaseNotificationAdapter } from "../../utils/FirebaseNotificationAdapter";
import { NotificationAdapter } from "../../utils/NotificationAdapter";

const router = express.Router();

// Send Notification to all devices registered to application
// PUT /notifications
router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) =>
    await performAction(req, res, NotificationController.sendAll)
);
// Target specific user(s)
// PUT /notifications/target
router.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) =>
    await performAction(req, res, NotificationController.sendToTarget)
);

export class NotificationController {
  static async sendToTarget(req, res) {
    const { title, body, userId } = req.body;
    if (!title || !body || !userId) {
      return res.status(400).json({
        error: "Title, body, and userId are required to send notifications."
      });
    }
    let application = await Application.lookupApp({ _id: req.user.id });
    let devices = await this.findDevices(userId);
    let deviceTokens = this.getTokens(devices);
    let adapter = this.getAdapter(application);
    return await this.sendToDevices(adapter, deviceTokens, { title, body });
  }

  static async sendAll(req, res) {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        error: "title and body are required to send push notifications."
      });
    }
    let app = await Application.lookupApp({ _id: req.user.id });
    let adapter = this.getAdapter(app);

    return await adapter.send(app.id, { title, body });
  }

  static async subscribeToTopic(req, res) {
    const { device_token, topic } = req.body;
    if (!device_token || !topic) {
      return res.status(400).json({
        error: "device_token and topic are required to register with a topic."
      });
    }
    let adapter = this.getAdapter(
      await Application.lookupApp({ _id: req.user.id })
    );
    return await adapter.subscribe(topic, device_token);
  }

  /**
   *
   * @param {NotificationAdapter} adapter
   * @param {Array<String>} tokens
   */
  static async sendToDevices(adapter, tokens, content) {
    return await adapter.sendToSeveral(tokens, content);
  }

  /**
   *
   * @param {Array<Device>} devices
   */
  static getTokens(devices) {
    return devices.map(v => v.device_token);
  }

  /**
   *
   * @param {String} userId
   * @returns {Promise<Array<Device>>}
   */
  static async findDevices(userId) {
    try {
      return Device.find({ userId });
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {Application} app
   * @returns {NotificationAdapter}
   */
  static getAdapter(app) {
    const { provider, database_url, provider_credentials } = app;
    switch (provider) {
      case "firebase":
        return FirebaseNotificationAdapter.initApp(
          app.id,
          provider_credentials,
          database_url
        );
      default:
        return null;
    }
  }
}

/**
 *
 * @param {*} application
 * @param {*} req
 * @returns {Promise<firebase.messaging>}
 */
export const initOrReturnFirebaseApp = async (application, req) => {
  let foundApp;
  let fb;
  let foundIndex;
  const { provider_credentials, database_url, id } = application;
  for (let i = 0; i < firebase.apps.length; i++) {
    let e = firebase.apps[i];
    if (e.name === id) {
      foundApp = e;
      foundIndex = i;
    }
  }
  if (foundApp) {
    return foundApp.messaging();
  } else {
    let initFB = initFirebase(provider_credentials, database_url, id);
    console.log(firebase.app.name);
    console.log(firebase);
    return initFB.messaging();
  }

  return firebase.messaging(firebase.apps[foundIndex]);
};

export const subscribeToTopic = async (application, token, req) => {
  let fb = await initOrReturnFirebaseApp(application, req);
  return await fb.subscribeToTopic(token, application.id);
};

/**
 *
 * @param {Object} details database authentication details
 * @param {String} dbURL url of database
 * @param {String} appName the unique name of application.  Usually app id
 */
const initFirebase = (details, dbURL, appName) => {
  return firebase.initializeApp(
    {
      credential: firebase.credential.cert(details),
      databaseURL: dbURL
    },
    appName
  );
};

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const NotificationRouter = router;
