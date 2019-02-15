import mongoose from "mongoose";
import { Mockgoose } from "mockgoose";
import { mockReq, mockRes } from "sinon-express-mock";
import { expect } from "chai";
import { DeviceController } from "../routes/api/DeviceController";
import Application from "../models/Application";
let mockgoose = new Mockgoose(mongoose);

describe("Device Controller Tests", () => {
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

  it("should register device", async () => {
    try {
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
      let req = mockReq({
        body: {
          client_key: app.client_key,
          userId: "test_user",
          device_token: "test_device_token",
          device_type: "ios"
        },
        headers: {
          client_application_key: app.client_key
        }
      });
      let res = mockRes();
      let registration = await MockDeviceController.registerDevice(req, res);
      expect(registration.device).to.not.be.null;
      expect(registration.device).to.not.be.undefined;
    } catch (error) {
      expect(error).to.be.null;
    }
  });
  it("should fail to register device missing headers", async () => {
    try {
      let req = mockReq();
      let res = mockRes();
      await MockDeviceController.registerDevice(req, res);
    } catch (err) {
      expect(err).to.not.be.null;
      expect(err).to.not.be.undefined;
    }
  });
  it("should fail to register no application with id", async () => {
    try {
      let req = mockReq({
        body: {
          client_key: "test_123",
          userId: "test_user",
          device_token: "test_device_token",
          device_type: "ios"
        },
        headers: {
          client_application_key: "test_123"
        }
      });
      let res = mockRes();
      await DeviceController.registerDevice(req, res);
    } catch (err) {
      expect(err).to.not.be.null;
      expect(err).to.not.be.undefined;
    }
  });
});

class MockDeviceController extends DeviceController {
  static async lookupApplicationByClientKey(clientKey) {
    return new Application();
  }
}
