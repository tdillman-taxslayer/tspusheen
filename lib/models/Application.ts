import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

export const ApplicationSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    max: 256
  },
  /* Public key to help organize where the app is coming from */
  client_key: {
    type: String,
    required: true
  },
  /* Server to server communication key.  Acts as a 'super' admin of the application. This should never be shown / shared */
  secret_key: {
    type: String,
    required: true,
    select: false
  }
});
