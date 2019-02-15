import mongoose from "mongoose";
import { Mockgoose } from "mockgoose";
import { mockReq, mockRes } from "sinon-express-mock";
import { expect } from "chai";
import { NotificationController } from "../routes/api/NotificationController";
import Application from "../models/Application";
import Device from "../models/Device";
import { MockFirebaseNoteAdapter } from "./NotificationAdapter.spec";
import { NotificationAdapter } from "../utils/NotificationAdapter";
let mockgoose = new Mockgoose(mongoose);
const userId = "userId123";
const deviceToken = "deviceToken123";
describe("Notification Controller Tests", () => {
  before(function(done) {
    this.timeout(5000);
    mockgoose.prepareStorage().then(() => {
      mongoose.connect(
        "mongodb://localhost:27017/test",
        { useNewUrlParser: true },
        function(err) {
          if (err) {
            done(err);
          } else {
            done();
          }
        }
      );
    });
  });

  afterEach(function(done) {
    this.timeout(5000);
    mockgoose.helper.reset().then(() => done());
  });

  it("should send notification to target", async () => {
    let app = await Application.generateApplication(
      {
        provider: "firebase",
        provider_credentials: { test: "creds" },
        name: "testapp",
        database_url: "http://test.com"
      },
      "clientkey",
      (await Application.generateSecretKey(40)).hash
    );
    let devices = await generateDevices(app.client_key);
    expect(devices.length).to.equal(10);

    let req = mockReq();
    let res = mockRes();
    let adapter = MockNotificationController.getAdapter(app);
    let deviceTokens = MockNotificationController.getTokens(devices);
    expect(deviceTokens.length).to.equal(10);
    expect(adapter).to.not.be.null;
    expect(adapter).to.not.be.undefined;
    let result = await MockNotificationController.sendToDevices(
      adapter,
      deviceTokens,
      { title: "test", body: "test body" }
    );
    expect(result.successCount).to.equal(10);
  });

  it("should send notification to all devices registered to topic", async () => {
    let app = await Application.generateApplication(
      {
        provider: "firebase",
        provider_credentials: { test: "creds" },
        name: "testapp",
        database_url: "http://test.com"
      },
      "clientkey",
      (await Application.generateSecretKey(40)).hash
    );
    let devices = await generateDevices(app.client_key);
    expect(devices.length).to.equal(10);
    let req = mockReq({ body: { title: "testTitle", body: "testBody" } });
    let res = mockRes();
    req.user = {};
    req.user.id = app.id;
    let adapter = MockNotificationController.getAdapter(app);
    let deviceTokens = MockNotificationController.getTokens(devices);
    expect(deviceTokens.length).to.equal(10);
    expect(adapter).to.not.be.null;
    expect(adapter).to.not.be.undefined;
    let result = await MockNotificationController.sendAll(req, res);
    expect(result.messageId).to.equal(1234);
  });

  it("should subscribe to topic", async () => {
    let app = await Application.generateApplication(
      {
        provider: "firebase",
        provider_credentials: { test: "creds" },
        name: "testapp",
        database_url: "http://test.com"
      },
      "clientkey",
      (await Application.generateSecretKey(40)).hash
    );
    let devices = await generateDevices(app.client_key);
    let device = devices[0]; // grab first device
    let req = mockReq({
      body: {
        device_token: device.device_token,
        topic: "testtopic"
      }
    });
    req.user = {};
    req.user.id = app.id;
    let res = mockRes();
    let result = await MockNotificationController.subscribeToTopic(req, res);
    expect(result.successCount).to.equal(1);
  });

  it("should map devices", async () => {
    let devices = await generateDevices("testkey");
    expect(devices.length).to.equal(10);
    let deviceTokens = MockNotificationController.getTokens(devices);
    expect(deviceTokens.length).to.equal(10);
  });
});

/**
 * Generates several fake devices
 */
const generateDevices = async clientKey => {
  let promises = [];
  for (let i = 0; i < 10; i++) {
    let newDevice = new Device({
      userId: userId,
      client_key: clientKey,
      device_token: deviceToken,
      device_type: "ios"
    });
    promises.push(newDevice.save());
  }
  return await Promise.all(promises);
};

class MockNotificationController extends NotificationController {
  /**
   *
   * @param {Application} app
   * @returns {NotificationAdapter}
   */
  static getAdapter(app) {
    const { database_url, provider_credentials } = app;
    return new MockFirebaseNoteAdapter({
      name: app.id,
      credentials: provider_credentials,
      dbURL: database_url
    });
  }
}
