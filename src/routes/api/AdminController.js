import express from "express";
import { performAction, requireAdminKey } from "../../utils/utils";
import Application from "../../models/Application";

const router = express.Router();
/**
 * @swagger
 * paths:
 *  /utils/applications/{applicationId}:
 *    get:
 *      description: Get the application by the Object ID
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: applicationId
 *          description: Application Object ID
 *          in: path
 *          required: true
 *          type: string
 *        - name: admin_client_key
 *          description: admin application secret key
 *          in: header
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: valid application
 *          schema:
 *              $ref: "#/definitions/Application"
 *        403:
 *          description: not authorized to make changes
 *      security:
 *        - admin_client_key: []
 */
router.get(
  "/applications/:applicationId",
  requireAdminKey,
  async (req, res) => await performAction(req, res, getApplication)
);

/**
 * @swagger
 * paths:
 *  /utils/applications/{applicationId}/reset:
 *    get:
 *      description: Resets the secret key for the application ID.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: applicationId
 *          description: Application Object ID
 *          in: path
 *          required: true
 *          type: string
 *        - name: admin_client_key
 *          description: admin application secret key
 *          in: header
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: valid application
 *          schema:
 *              $ref: "#/definitions/Application"
 *        403:
 *          description: not authorized to make changes
 */
router.get(
  "/applications/:applicationId/reset",
  requireAdminKey,
  async (req, res) => await performAction(req, res, resetSecretKey)
);

/**
 * @swagger
 * paths:
 *  /utils/applications:
 *    get:
 *      description: Resets the secret key for the application ID.
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: admin_client_key
 *          description: admin application secret key
 *          in: header
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: valid application
 *          schema:
 *            type: array
 *            items:
 *              $ref: "#/definitions/Application"
 *        403:
 *          description: not authorized to make changes
 */
router.get(
  "/applications",
  requireAdminKey,
  async (req, res) => await performAction(req, res, getAllApplications)
);

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getApplication = async (req, res) => {
  const { applicationId } = req.params;
  let application = await Application.findById(applicationId).select(
    "secret_key client_key provider_credentials"
  );
  if (!application) {
    return res
      .status(404)
      .json({ error: `Application with id ${applicationId} was not found.` });
  }
  let app = {
    id: application.id,
    secret_key: application.secret_key,
    client_key: application.client_key,
    name: application.name,
    provider_credentials: application.provider_credentials
  };
  return app;
};

const getAllApplications = async (req, res) => {
  let applications = await Application.find().select(
    "secret_key client_key provider_credentials database_url"
  );
  let resolved = [];
  applications.forEach(application => {
    resolved.push({
      id: application.id,
      secret_key: application.secret_key,
      client_key: application.client_key,
      name: application.name,
      provider_credentials: application.provider_credentials,
      database_url: application.database_url
    });
  });
  return resolved;
};

/**
 * Reset the application's secret key
 * @param {Request} req
 * @param {Response} res
 */
const resetSecretKey = async (req, res) => {
  const { applicationId } = req.params;
  let application = await Application.findById(applicationId).select(
    "secret_key client_key provider_credentials"
  );
  if (!application) {
    return res
      .status(404)
      .json({ error: `Application with id ${applicationId} was not found.` });
  }
  let newSecret = await Application.generateSecretKey(40);
  application.secret_key = newSecret.hash;
  await application.save();
  return { id: application.id, secret: newSecret.secretKey };
};

export const AdminRouter = router;
