"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisteredApplicationsController_1 = require("../controllers/RegisteredApplicationsController");
class Routes {
    constructor() {
        this.applicationController = new RegisteredApplicationsController_1.RegisteredApplicationsController();
    }
    routes(app) {
        app.route("/api/v1/applications").get(this.applicationController.all);
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map