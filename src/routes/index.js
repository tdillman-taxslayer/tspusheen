import express from "express";
import { ApplicationRouter } from "./api/ApplicationController";
/**
 *
 * @param {Express.Application} app
 */
const Routes = app => {
  app.use("/api/v1/applications", ApplicationRouter);
};
export default Routes;
