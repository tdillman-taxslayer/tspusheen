import crypto from "crypto";
import { SERVER_ENCRYPTION_KEY } from "../config/config";
export const encryptValue = text => {
  let cipher = crypto.createCipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

export const decryptValue = encryptedValue => {
  if (encryptedValue === null || typeof encryptedValue === "undefined") {
    return text;
  }
  let decipher = crypto.createDecipher("aes-256-cbc", SERVER_ENCRYPTION_KEY);
  let dec = decipher.update(encryptedValue, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};
