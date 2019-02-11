import { expect } from "chai";
import { mockReq, mockRes } from "sinon-express-mock";
import { Utils, HeaderSecurity } from "../utils/utils";
import { ADMIN_CLIENT_HEADER_KEY } from "../config/config";

const _clientKey = "client_key_valid";
describe("Utility Tests", () => {
  it("Encrypt Value and Decrypt Value", async function(done) {
    try {
      let initValue = "My Value";
      let encrypted = Utils.encryptValue(initValue);
      expect(encrypted).not.to.equal(initValue);
      expect(encrypted).to.equal("339587dab8bd97045abcf912890f8381");
      let decrypted = Utils.decryptValue("339587dab8bd97045abcf912890f8381");
      expect(decrypted).to.equal(initValue);
      done();
    } catch (error) {
      done(error);
    }
  });

  it("requires client application key when present and matches", async done => {
    try {
      let mockRequest = mockReq({
        headers: { client_application_key: _clientKey }
      });
      let mockResponse = mockRes(null);
      MockHeaderSecurity.requireKey(mockRequest, mockResponse, function(err) {
        expect(err).to.be.null;
        done();
      });
    } catch (error) {
      done(error);
    }
  }).timeout(1000);

  it("requires client applicaiton key when present and not matches", done => {
    let mockRequest = mockReq({
      headers: { client_application_key: "not matching" }
    });
    let mockResponse = mockRes(null);
    MockHeaderSecurity.requireKey(mockRequest, mockResponse, function(err) {
      expect(err).to.not.be.null;
      done();
    });
  });

  it("requires client app key header not present", done => {
    let mockRequest = mockReq({
      headers: {}
    });
    let mockResponse = mockRes(null);
    MockHeaderSecurity.requireKey(mockRequest, mockResponse, err => {
      expect(err).to.not.be.null;
      done();
    });
  });

  it("requires admin key not matching", done => {
    let mockRequest = mockReq({
      headers: { admin_client_key: "not matching" }
    });
    let mockResponse = mockRes(null);
    MockHeaderSecurity.requireAdminKey(mockRequest, mockResponse, err => {
      expect(err).to.not.be.null;
      done();
    });
  });

  it("requires admin key matching", done => {
    let mockRequest = mockReq({
      headers: { admin_client_key: ADMIN_CLIENT_HEADER_KEY }
    });
    let mockResponse = mockRes(null);
    MockHeaderSecurity.requireAdminKey(mockRequest, mockResponse, err => {
      expect(err).to.be.null;
      done();
    });
  });
});

class MockHeaderSecurity extends HeaderSecurity {
  static async clientKeyMatchesApplication(clientKey, cb) {
    cb(clientKey === _clientKey ? true : false);
  }
}
