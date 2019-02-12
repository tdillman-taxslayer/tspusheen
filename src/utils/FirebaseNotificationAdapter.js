import * as admin from "firebase-admin";
import { NotificationAdapter } from "./NotificationAdapter";

export class FirebaseNotificationAdapter extends NotificationAdapter {
  /**
   *
   * @param {{ name: String, credentials: Object, dbURL: String}} config
   */
  constructor(config) {
    super();
    this.app = this.findApp(config.name);
    if (!this.app) {
      // no app with name initalized with firebase
      this.app = this.initApp(config.name, config.credentials, config.dbURL);
    }
  }
  /**
   *
   * @param {String} name
   * @returns {admin.app.App}
   */
  findApp(name) {
    return admin.apps.find((app, i, obj) => {
      return app.name === name;
    });
  }
  /**
   *
   * @param {String} topic
   * @param {String} token
   * @returns {admin.messaging.MessagingTopicResponse}
   */
  async subscribe(topic, token) {
    let result = await this.app.messaging().subscribeToTopic(token, topic);
    return result;
  }

  initApp(name, credentials, url) {
    return admin.initializeApp(
      { credential: credentials, databaseURL: url },
      name
    );
  }
}
