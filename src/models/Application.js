import mongoose, { Schema } from "mongoose";
import { decryptValue, encryptValue } from "../utils/utils";

const ApplicationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  client_key: {
    type: String,
    required: true,
    select: false,
    get: decryptValue,
    set: encryptValue
  },
  secret_key: {
    type: String,
    required: true,
    select: false,
    get: decryptValue,
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

const Application = mongoose.model("application", ApplicationSchema);
export default Application;
