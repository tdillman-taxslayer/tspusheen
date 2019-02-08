import express from "express";
import bcrypt from "bcryptjs";
import cryptoString from "crypto-random-string";
import jwt from "jsonwebtoken";
import Application from "../../models/Application";
import { JWT_SECRET_KEY } from "../../config/config";

const router = express.Router();
/**
 * @swagger
 * paths:
 *  /applications:
 *    get:
 *      description: Gets a brief list of applications registered on the server.  This spits out public information.
 *      responses:
 *        200:
 *          description: Successful operation
 *          schema:
 *            type: array
 *            items:
 *              $ref: "#/definitions/Application_Light"
 *    post:
 *      summary: "Create and register a new application."
 *      operationId: "create"
 *      consumes:
 *      - "application/json"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - in: body
 *        name: body
 *        description: "Application Object"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Application"
 *      reponses:
 *        200:
 *          description: Successful operation
 *          schema:
 *            $ref: "#/definitions/Application"
 */
// /applications
router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  async (req, res) => await performAction(req, res, getAll)
);
// /applications
router.post("/", async (req, res) => await performAction(req, res, create));
/**
 * @swagger
 * paths:
 *  /applications/authenticate:
 *    post:
 *      description: authenticates with application
 *      parameters:
 *      - in: body
 *        name: body
 *        description: "Required parameters to authenticate with application"
 *        schema:
 *          $ref: "#/definitions/Authentication"
 *        required: true
 * definitions:
 *  Authentication:
 *    required:
 *    - id
 *    - secret_key
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *      secret_key:
 *        type: string
 *        description: auto generated, hashed and encrypted "password"
 */

// /applications/authenticate
router.post(
  "/authenticate",
  async (req, res) => await performAction(req, res, authenticate)
);

const performAction = async (req, res, fn) => {
  try {
    return res.json(await fn(req, res));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  return await Application.find().select("client_key");
};

const create = async (req, res) => {
  let newApplication = new Application(req.body);
  newApplication.client_key = cryptoString(40);
  let secretKey = await Application.generateSecretKey(40);
  newApplication.secret_key = secretKey.hash;
  return {
    application: await newApplication.save(),
    secret: secretKey.secretKey
  };
};
/**
 * Authenticate with application requiring id and secret key
 * @param {Request} req
 * @param {Response} res
 */
const authenticate = async (req, res) => {
  const { id, secretKey } = req.body;
  if (!id) {
    return res.status(400).json({ error: "id parameter required." });
  }
  let application = await Application.findById(id).select("secret_key");
  if (!application) {
    return res
      .status(404)
      .json({ error: `Application with id ${id} does not exist.` });
  }
  let compare = await bcrypt.compare(secretKey, application.secret_key);
  if (!compare) {
    return res.status(403).json({ error: "Invalid secret key." });
  }

  // generate token
  let token = jwt.sign({ id: application.id }, JWT_SECRET_KEY, {
    expiresIn: 3600
  });
  return { token: `Bearer ${token}` };
};

export const ApplicationRouter = router;
