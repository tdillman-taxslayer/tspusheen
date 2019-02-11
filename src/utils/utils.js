import crypto from "crypto";
import Application from "../models/Application";
import {
  SERVER_ENCRYPTION_KEY,
  ADMIN_CLIENT_HEADER_KEY
} from "../config/config";

export class Utils {
  /**
   * Encrypts a value using AES 256 CBC
   * @param {String} text
   */
  static encryptValue(text) {
    let cipher = crypto.createCipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
    let crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  }
  /**
   * Decrypts String via AES 256 CBC
   * @param {String} encryptedValue
   */
  static decryptValue(encryptedValue) {
    if (encryptedValue === null || typeof encryptedValue === "undefined") {
      return text;
    }
    let decipher = crypto.createDecipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
    let dec = decipher.update(encryptedValue, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }

  /**
   *
   * @param {Request} req
   * @param {Response} res
   * @param {Function} fn
   */
  static async performAction(req, res, fn) {
    try {
      return res.json(await fn(req, res));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export class HeaderSecurity {
  /**
   *
   * @param {Application} model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Ensures the incoming device request has an client key that has a valid application
   * @param {Request} req
   * @param {Response} res
   * @param {*} next
   */
  static requireKey(req, res, next) {
    if (req.headers["client_application_key"]) {
      const { client_application_key } = req.headers;
      this.clientKeyMatchesApplication(client_application_key, matches => {
        if (matches) {
          return next(null);
        } else {
          let err = new Error();
          err.message = "Not Authorized to make changes.";
          return next(err);
        }
      });
    } else {
      let err = new Error();
      err.message = "Not Authorized to make changes";
      return next(err);
      // return res.status(403).json({ error: "Not authorized to make changes" });
    }
  }

  /**
   * Ensures the incoming request from an admin is allowed. Protects route from unauthorized access.
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   */
  static requireAdminKey(req, res, next) {
    const { admin_client_key } = req.headers;
    let err = new Error();
    err.message = "Not authorized to make changes";
    if (!admin_client_key) {
      // return res.status(403).json({ error: "Not authorized to make changes" });
      return next(err);
    }
    if (admin_client_key !== ADMIN_CLIENT_HEADER_KEY) {
      // return res.status(403).json({ error: "Not authorized to make changes." });
      return next(err);
    }
    return next(null);
  }

  static clientKeyMatchesApplication(clientKey, cb) {
    Application.findOne({
      client_application_key: clientKey
    })
      .then(app => {
        if (!app) {
          cb(false);
        } else {
          cb(true);
        }
      })
      .catch(err => {
        cb(false);
      });
  }
}
