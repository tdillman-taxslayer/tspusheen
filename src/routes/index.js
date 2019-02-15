import express from "express";
import { ApplicationRouter } from "./api/ApplicationController";
import { DeviceRouter } from "./api/DeviceController";
import { NotificationRouter } from "./api/NotificationController";
import { AdminRouter } from "./api/AdminController";

export default class Routes {
  /**
   *
   * @param {Express.Application} app
   */
  constructor(app) {
    this.applicationRouter = ApplicationRouter;
    this.deviceRoute = DeviceRouter;
    this.notificationRouter = NotificationRouter;
    this.adminRouter = AdminRouter;
    app.use("/api/v1/applications", this.applicationRouter);
    app.use("/api/v1/devices", this.deviceRoute);
    app.use("/api/v1/notifications", this.notificationRouter);
    app.use("/api/v1/utils", this.adminRouter);
  }
}
