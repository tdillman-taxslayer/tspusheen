import express from "express";
import bodyParser from "body-parser";
import http from "http";
import passport from "passport";
import mongoose from "mongoose";
import { MONGODB_URI, PORT } from "./config/config";
import Routes from "./routes";

const app = express();
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "15mb" }));
app.use(passport.initialize());

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

Routes(app);

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
