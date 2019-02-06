import express from "express";
import { ApplicationRouter } from "./api/ApplicationController";
import { DeviceRouter } from "./api/DeviceController";
import { NotificationRouter } from "./api/NotificationController";
/**
 *
 * @param {Express.Application} app
 */
const Routes = app => {
  app.use("/api/v1/applications", ApplicationRouter);
  app.use("/api/v1/devices", DeviceRouter);
  app.use("/api/v1/notifications", NotificationRouter);
};
export default Routes;
