/**
 * Wrap the library around an adapter which unifies the interfaces for each Push system.
 */
export class NotificationAdapter {
  constructor() {
    this.app = null;
  }
  async subscribe(topic, token) {}

  send(topic) {}

  getApp(name) {}

  unsubscribe(topic) {}

  sendTo(device) {}
}
