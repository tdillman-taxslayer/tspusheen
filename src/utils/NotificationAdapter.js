/**
 * Wrap the library around an adapter which unifies the interfaces for each Push system.
 */
export class NotificationAdapter {
  constructor() {
    this.app = null;
  }
  async subscribe(topic, token) {}
  /**
   *
   * @param {String} topic
   * @param {{title: String, body: String}} content
   */
  async send(topic, content) {}

  findApp(name) {}

  async unsubscribe(token, topic) {}

  async unsubscribeMany(tokens, topic) {}

  async sendTo(token, content) {}

  async sendToSeveral(devices, content) {}
}
