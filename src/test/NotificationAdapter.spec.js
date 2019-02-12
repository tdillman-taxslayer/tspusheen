import { expect } from "chai";
import { FirebaseNotificationAdapter } from "../utils/FirebaseNotificationAdapter";

describe("Notification Adapter Tests", () => {
  it("should initalize", done => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let app = adapter.findApp("testapp");
    expect(app).to.not.be.null;
    expect(app).to.not.be.undefined;
    expect(app.name).to.equal("testapp");
    done();
  });

  it("should subscribe to topic", done => {
    done(new Error("not implemented"));
  });
  // it("should send to topic", done => {
  //   done(new Error("not implemented"));
  // });
  // it("should initalize or return app", done => {
  //   let adapter = new MockFirebaseNotificationAdapter({ app: "credentials" });
  //   let app = adapter.findOrInitApp("test123");
  //   expect(app.name).to.equal("test123");
  // });
  // it("should get specific app", done => {
  //   done(new Error("not implemented"));
  // });
  // it("should unsubscribe to topic", done => {
  //   done(new Error("not implemented"));
  // });
  // it("should send to specific device", done => {
  //   done(new Error("not implemented"));
  // });
});

class MockFirebaseNoteAdapter extends FirebaseNotificationAdapter {
  constructor(config) {
    super(config);
  }

  findApp(name) {
    if (!this.app) {
      return null;
    }
    return this.app.apps.find(app => {
      return app.name === name;
    });
  }

  initApp(name, credentials, url) {
    return new MockFirebaseAdmin(name, credentials, url);
  }
}

class MockFirebaseAdmin {
  constructor(name, credentials, url) {
    this.name = name;
    this.credentials = credentials;
    this.databaseURL = url;
    this.apps = [];
    this.apps.push({ name });
  }
}
