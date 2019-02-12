import mongoose from "mongoose";
import { expect } from "chai";
import { Mockgoose } from "mockgoose";
import { mockReq, mockRes } from "sinon-express-mock";
import Application from "../models/Application";
import { AdminController } from "../routes/api/AdminController";
let mockgoose = new Mockgoose(mongoose);
describe("Application Controller Tests", () => {
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
    // dropping loads
    this.timeout(5000);
    mockgoose.helper.reset().then(() => done());
    // loads dropped
  });

  it("should get a single applications", async () => {
    try {
      let app1 = await generateApplication("App 1");
      let app2 = await generateApplication("App 2");
      let res = mockRes();
      let req = mockReq({ params: { applicationId: app2.id } });
      let app = await AdminController.getApplication(req, res);
      expect(app).to.not.be.null;
      expect(app.id).to.equal(app2.id);
    } catch (err) {
      throw err;
    }
  }).timeout(5000);

  it("should get all applications", async () => {
    try {
      await generateApplication("App 1");
      await generateApplication("App 2");
      let res = mockRes();
      let req = mockReq();
      let apps = await AdminController.getAllApplications(req, res);
      expect(apps.length).to.equal(2);
    } catch (err) {
      throw err;
    }
  });

  it("should reset a secret key", async () => {
    try {
      let app1 = await generateApplication("App 1");
      let encryptedSecret = app1.secret_key;
      let newSecret = await AdminController.resetSecretKey(
        mockReq({ params: { applicationId: app1.id } }),
        mockRes()
      );
      let app1NewSecret = await AdminController.findApplicationById(
        app1.id,
        "secret_key"
      );
      expect(app1NewSecret.secret_key).to.not.equal(app1.secret_key);
      expect(app1NewSecret.secret_key).to.not.equal(encryptedSecret);
    } catch (err) {
      throw err;
    }
  });
});

const generateApplication = async appName => {
  let newApp = new Application({
    name: appName,
    provider: "firebase",
    provider_credentials: { type: "test" },
    database_url: "http://test.com"
  });
  newApp.client_key = "test";
  newApp.secret_key = "test";
  return await newApp.save();
};
