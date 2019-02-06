import mongoose, { Schema } from "mongoose";
import { decryptValue, encryptValue } from "../utils/utils";
import cryptoString from "crypto-random-string";
import bcrypt from "bcryptjs";

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
