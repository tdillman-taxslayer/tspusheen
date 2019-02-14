import mongoose from "mongoose";
import { Mockgoose } from "mockgoose";
import { mockReq, mockRes } from "sinon-express-mock";
import { expect } from "chai";
import { ApplicationController } from "../routes/api/ApplicationController";
import Application from "../models/Application";
import { fail } from "assert";
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
    this.timeout(5000);
    mockgoose.helper.reset().then(() => done());
  });

  it("should create application", async () => {
    let req = mockReq({
      body: {
        name: "Test App",
        provider_credentials: {
          test: "creds"
        },
        database_url: "http://test.com",
        provider: "firebase"
      }
    });
    let res = mockRes();
    let result = await ApplicationController.create(req, res);
    expect(result).to.not.be.null;
    expect(result).to.not.be.undefined;
    expect(result.secret).to.not.be.null;
    expect(result.application).to.not.be.null;
  });

  it("should fail to create application", async () => {
    try {
      let req = mockReq();
      let res = mockRes();
      let result = await ApplicationController.create(req, res);
      fail("should not pass, invalid application");
    } catch (err) {
      expect(err).to.not.be.null;
      expect(err).to.not.be.undefined;
    }
  });

  it("should authenticate", async () => {
    let appCreateReq = mockReq({
      body: {
        name: "Test App",
        provider_credentials: {
          test: "creds"
        },
        database_url: "http://test.com",
        provider: "firebase"
      }
    });
    let appCreateRes = mockRes();
    let appResult = await ApplicationController.create(
      appCreateReq,
      appCreateRes
    );
    let secret = appResult.secret;
    let app = appResult.application;
    let req = mockReq({
      body: {
        id: app.id,
        secretKey: secret
      }
    });
    let res = mockRes();
    let result = await ApplicationController.authenticate(req, res);
    expect(result.token).to.not.be.null;
    expect(result.token).to.not.be.undefined;
  });

  it("should fail to authenticate", async () => {
    let appCreateReq = mockReq({
      body: {
        name: "Test App",
        provider_credentials: {
          test: "creds"
        },
        database_url: "http://test.com",
        provider: "firebase"
      }
    });
    let appCreateRes = mockRes();
    let appResult = await ApplicationController.create(
      appCreateReq,
      appCreateRes
    );
    let app = appResult.application;
    let req = mockReq({
      body: {
        id: app.id,
        secretKey: "invalid secret"
      }
    });
    let res = mockRes();
    let result = await ApplicationController.authenticate(req, res);
    expect(result.token).to.be.undefined;
  });

  it("should get all applications", async () => {
    let apps = await createApplications(10);
    let req = mockReq();
    let res = mockRes();
    let result = await ApplicationController.getAll(req, res);
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(10);
  }).timeout(5000);
});

const createApplications = async amount => {
  let promises = [];
  for (let i = 0; i < amount; i++) {
    promises.push(
      Application.generateApplication(
        {
          provider: "firebase",
          provider_credentials: { test: "creds" },
          name: "testapp",
          database_url: "http://test.com"
        },
        "clientkey",
        (await Application.generateSecretKey(40)).hash
      )
    );
  }
  return await Promise.all(promises);
};
