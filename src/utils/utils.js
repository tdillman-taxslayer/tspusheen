import crypto from "crypto";
import {
  SERVER_ENCRYPTION_KEY,
  ADMIN_CLIENT_HEADER_KEY
} from "../config/config";
import Application from "../models/Application";
/**
 * Encrypts a value using AES 256 CBC
 * @param {String} text
 */
export const encryptValue = text => {
  let cipher = crypto.createCipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

/**
 * Decrypts String via AES 256 CBC
 * @param {String} encryptedValue
 */
export const decryptValue = encryptedValue => {
  if (encryptedValue === null || typeof encryptedValue === "undefined") {
    return text;
  }
  let decipher = crypto.createDecipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
  let dec = decipher.update(encryptedValue, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

/**
 * Ensures the incoming device request has an client key that has a valid application
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
export const requireKey = (req, res, next) => {
  if (req.headers["client_application_key"]) {
    const { client_application_key } = req.headers;
    Application.findOne({
      client_key: client_application_key
    })
      .then(app => {
        return next();
      })
      .catch(err => {
        return res.status(404).json({
          error: `Application with client key ${
            req.headers["client_application_key"]
          } not found.`
        });
      });
  } else {
    return res.status(403).json({ error: "Not authorized to make changes" });
  }
};

/**
 * Ensures the incoming request from an admin is allowed. Protects route from unauthorized access.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export const requireAdminKey = (req, res, next) => {
  const { admin_client_key } = req.headers;
  if (!admin_client_key) {
    return res.status(403).json({ error: "Not authorized to make changes" });
  }
  if (admin_client_key !== ADMIN_CLIENT_HEADER_KEY) {
    return res.status(403).json({ error: "Not authorized to make changes." });
  }
  return next();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} fn
 */
export const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
