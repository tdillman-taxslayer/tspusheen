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

  async send(topic, content) {
    let result = await this.app.messaging().sendToTopic(topic, {
      notification: { title: content.title, body: content.body }
    });
    return result;
  }
  /**
   *
   * @param {String} token
   * @param {{ title: String, body: String }} content
   */
  async sendTo(token, content) {
    let message = {
      notification: {
        title: content.title,
        body: content.body
      }
    };
    let result = await this.app.messaging().sendToDevice(token, message);
    return result;
  }
  /**
   *
   * @param {Array<String>} devices
   * @param {{ title: String, body: String }} content
   */
  async sendToSeveral(devices, content) {
    let message = {
      notification: {
        title: content.title,
        body: content.body
      }
    };
    let result = await this.app.messaging().sendToDevice(devices, message);
    return result;
  }

  /**
   *
   * @param {String} token
   * @param {String} topic
   */
  async unsubscribe(token, topic) {
    let result = await this.app.messaging().unsubscribeFromTopic(token, topic);
    return result;
  }

  /**
   *
   * @param {Array<String>} tokens
   * @param {String} topic
   */
  async unsubscribeMany(tokens, topic) {
    let result = await this.app.messaging().unsubscribeFromTopic(tokens, topic);
    return result;
  }
}
