import express from "express";
import bodyParser from "body-parser";
import http from "http";
import passport from "passport";
import mongoose from "mongoose";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { MONGODB_URI, PORT } from "./config/config";
import Routes from "./routes";
import path from "path";
export const app = express();
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "15mb" }));
app.use(passport.initialize());

const basePath = path.join(__dirname, "..", "src");
const routesPath = path.join(basePath, "routes", "**", "*.js");
const securityPath = path.join(basePath, "config", "*.js");
const modelsPath = path.join(basePath, "models", "*.js");
const utilsPath = path.join(basePath, "utils", "*.js");

// Get your swag on
let options = {
  swaggerDefinition: {
    info: {
      title: "TSPusheen",
      version: "0.0.2"
    },
    basePath: "/api/v1"
  },
  apis: [modelsPath, routesPath, securityPath, utilsPath]
};

let swagSpec = swaggerJSDoc(options);

app.get("/api-docs.json", function(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swagSpec);
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swagSpec));

// Passport config
require("./config/passport")(passport);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

export const routes = new Routes(app);

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
