import mongoose from "mongoose";
import { Mockgoose } from "mockgoose";
import { mockReq, mockRes } from "sinon-express-mock";
import { expect } from "chai";
import Application from "../models/Application";

let mockgoose = new Mockgoose(mongoose);

describe("Application Model Tests", () => {
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
  it("should create and find application", async () => {
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
    expect(app).to.not.be.null;
    expect(app).to.not.be.undefined;
    let foundApp = await Application.lookupApp({ _id: app.id });
    expect(foundApp).to.not.be.null;
    expect(foundApp).to.not.be.undefined;
    expect(foundApp.name).to.equal(app.name);
  });
});
