import mongoose, { Schema } from "mongoose";

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
