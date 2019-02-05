import { Request, Response } from "express";
export class RegisteredApplicationsController {
  public all(req: Request, res: Response) {
    res.json([{ beep: "boop" }]);
  }

  public createApplication(req: Request, res: Response) {
    res.json({ beep: "boop" });
  }
}
