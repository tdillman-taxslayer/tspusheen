import mongoose, { Schema } from "mongoose";
import { decryptValue, encryptValue } from "../utils/utils";
import cryptoString from "crypto-random-string";
import bcrypt from "bcryptjs";
/**
 * @swagger
 * definitions:
 *  Application:
 *    required:
 *    - provider_credentials
 *    - database_url
 *    - provider
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      client_key:
 *        type: string
 *        description: public facing key, used by clients to identify what application they belong too.  THIS IS NOT A SECRET.  Do Not Use as a "security" feature.
 *      secret_key:
 *        type: string
 *        description: auto generated, hashed and encrypted "password"
 *      provider_credentials:
 *        type: object
 *        description: for firebase, this is a JSON file.  For other platforms this could be an api key.
 *      database_url:
 *        type: string
 *        description: this is mostly required for firebase, the URL to connect w/ the project database
 *      provider:
 *        type: string
 *        enum:
 *        - "firebase"
 *  Application_Light:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      client_key:
 *        type: string
 *        description: public facing key, used by clients to identify what application they belong too.  THIS IS NOT A SECRET.  Do Not Use as a "security" feature.
 */
const ApplicationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  /* this is considered public and not secure, compromised client_keys are not an issue */
  client_key: {
    type: String,
    required: true,
    select: false
  },
  /** Essentially a password for the application */
  secret_key: {
    type: String,
    required: true,
    select: false,
    get: v => {
      let decrypted = decryptValue(v);
      return decrypted;
    },
    set: encryptValue
  },
  provider_credentials: {
    type: String,
    required: true,
    select: false,
    get: v => {
      let decrypted = decryptValue(v);
      return JSON.parse(decrypted);
    },
    set: v => {
      let stringified = JSON.stringify(v);
      let encrypted = encryptValue(stringified);
      return encrypted;
    }
  },
  database_url: {
    type: String,
    required: true,
    select: false,
    get: decryptValue,
    set: encryptValue
  },
  provider: {
    type: String,
    required: true,
    enum: ["firebase"]
  }
});
/**
 * Generates a secret key
 * @param {Number} length length of the key to generate
 * @returns { hash: String, secretKey: String }
 */
ApplicationSchema.statics.generateSecretKey = async function(length) {
  let secretKey = cryptoString(length);
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(secretKey, salt);
  return { hash, secretKey };
};

const Application = mongoose.model("applications", ApplicationSchema);
export default Application;
