import express from "express";
import { ApplicationRouter } from "./api/ApplicationController";
import { DeviceRouter } from "./api/DeviceController";
import { NotificationRouter } from "./api/NotificationController";
import { AdminRouter } from "./api/AdminController";
/**
 *
 * @param {Express.Application} app
 */
const Routes = app => {
  app.use("/api/v1/applications", ApplicationRouter);
  app.use("/api/v1/devices", DeviceRouter);
  app.use("/api/v1/notifications", NotificationRouter);
  app.use("/api/v1/utils", AdminRouter);
};
export default Routes;
