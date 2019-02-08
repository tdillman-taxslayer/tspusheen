import mongoose, { Schema } from "mongoose";
/**
 * @swagger
 * definitions:
 *  Device:
 *    required:
 *    - client_key
 *    - userId
 *    - device_token
 *    - device_type
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      userId:
 *        type: string
 *        description: self generated and assigned key used to identify a user on a seperate system.
 *      client_key:
 *        type: string
 *      device_token:
 *        type: string
 *      device_type:
 *        type: string
 *        enum:
 *        - "ios"
 *        - "android"
 *        - "web"
 */
const DeviceSchema = new Schema({
  /* this can be any user id defined by the client */
  userId: {
    type: String,
    required: true
  },
  /* client keys are strictly used to identify which app the device belongs */
  client_key: {
    type: String,
    required: true
  },
  /* the device token */
  device_token: {
    type: String,
    required: true
  },
  /* denotes what kind of device this is */
  device_type: {
    type: String,
    required: true,
    enum: ["ios", "android", "web"]
  }
});

const Device = mongoose.model("device", DeviceSchema);
export default Device;
