import { Request, Response } from "express";
import { RegisteredApplicationsController } from "../controllers/RegisteredApplicationsController";
export class Routes {
  public applicationController: RegisteredApplicationsController = new RegisteredApplicationsController();
  public routes(app): void {
    app.route("/api/v1/applications").get(this.applicationController.all);
  }
}
