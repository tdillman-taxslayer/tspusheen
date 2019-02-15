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

  it("should subscribe to topic", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let results = await adapter.subscribe();
    expect(results).to.not.be.null;
    expect(results).to.not.be.undefined;
  });
  it("should send to topic", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let results = await adapter.send("testtopic", {
      title: "test",
      body: "test body"
    });
    expect(results).to.not.be.null;
    expect(results).to.not.be.undefined;
    expect(results.messageId).to.equal(1234);
  });

  it("should unsubscribe to topic", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let result = await adapter.unsubscribe("testtoken123", "testtopic");
    expect(result).to.not.be.null;
    expect(result).to.not.be.undefined;
    expect(result.successCount).to.equal(1);
  });

  it("should send to specific device", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let results = await adapter.sendTo("testDevice", {
      title: "test",
      body: "test body"
    });
    expect(results).to.not.be.null;
    expect(results).to.not.be.undefined;
    expect(results.successCount).to.equal(1);
  });

  it("should send to several devices", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let result = await adapter.sendToSeveral(["device1", "device2"], {
      title: "test",
      body: "test body"
    });
    expect(result).to.not.be.null;
    expect(result.successCount).to.equal(2);
    expect(result.failureCount).to.equal(0);
  });

  it("should unsubscribe many devices", async () => {
    let adapter = new MockFirebaseNoteAdapter({
      name: "testapp",
      credentials: { test: "creds" },
      dbURL: "http://test.com"
    });
    let result = await adapter.unsubscribeMany(["d1", "d2"], "topci");
    expect(result).to.not.be.null;
    expect(result).to.not.be.undefined;
    expect(result.successCount).to.equal(2);
  });
});

export class MockFirebaseNoteAdapter extends FirebaseNotificationAdapter {
  /**
   *
   * @param {{ name: String, credentials: Object, dbURL: String}} config
   */
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

  messaging() {
    return {
      subscribeToTopic: this.subscribeToTopic,
      sendToTopic: (topic, content) => {
        return { messageId: 1234 };
      },
      sendToDevice: (token, payload) => {
        let count = 1;
        if (Array.isArray(token)) {
          count = token.length;
        }
        return {
          canonicalRegistrationTokenCount: 1,
          failureCount: 0,
          multicastId: 123,
          results: [],
          successCount: count
        };
      },
      unsubscribeFromTopic: (token, topic) => {
        let count = 1;
        if (Array.isArray(token)) {
          count = token.length;
        }
        return {
          errors: [],
          failureCount: 0,
          successCount: count
        };
      }
    };
  }

  subscribeToTopic(token, topic) {
    return {
      errors: [],
      failureCount: 0,
      successCount: 1
    };
  }
}
