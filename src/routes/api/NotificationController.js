// controls sending push notifications to specific applications.
import express from "express";
import passport from "passport";
import firebase from "firebase-admin";
import Application from "../../models/Application";
import Device from "../../models/Device";

const router = express.Router();

// Send Notification to all devices registered to application
// PUT /notifications
router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => await performAction(req, res, sendAll)
);
// Target specific user(s)
// PUT /notifications/target
router.put(
  "/user",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => await performAction(req, res, sendToTarget)
);

const sendToTarget = async (req, res) => {
  // given target user id, query for all their devices.
  // with devices present, send message to each device.
  try {
    const { title, body, userId } = req.body;
    if (!title || !body || !userId) {
      return res.status(400).json({
        error:
          "title, body, and userId are required to send push notifications."
      });
    }
    let application = await lookupFullApp(req.user.id);
    let fb = await initOrReturnFirebaseApp(application, req);
    let devices = await Device.find({ userId });
    let sendAllPromises = [];
    devices.forEach(d => {
      const { device_token } = d;
      sendAllPromises.push(
        fb.sendToDevice(device_token, { notification: { title, body } })
      );
    });
    return await Promise.all(sendAllPromises);
  } catch (error) {
    throw error;
  }
};
/**
 * Sends push notification to all devices registered to the application.
 * @param {Request} req
 * @param {Response} res
 */
const sendAll = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        error: "title and body are required to send push notifications."
      });
    }
    let application = await lookupFullApp(req.user.id);
    const { id } = application;
    let fb = await initOrReturnFirebaseApp(application, req);
    return fb.sendToTopic(id, {
      notification: {
        title,
        body
      }
    });
  } catch (error) {
    throw error;
  }
};

const initOrReturnFirebaseApp = async (application, req) => {
  let foundApp;
  let fb;
  const { provider_credentials, database_url, id } = application;
  firebase.apps.forEach(e => {
    if (e.name === id) {
      foundApp = e;
    }
  });
  if (foundApp) {
    fb = foundApp;
  } else {
    let initFB = initFirebase(provider_credentials, database_url, id);
    return initFB.messaging();
  }

  return firebase.messaging(fb);
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

/**
 *
 * @param {String} appId Application ObjectId
 * @returns {Promise<Application>}
 */
export const lookupFullApp = async appId => {
  return await Application.findById(appId).select({
    client_key: 1,
    secret_key: 1,
    provider_credentials: 1,
    database_url: 1
  });
};

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const NotificationRouter = router;
