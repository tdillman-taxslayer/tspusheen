import express from "express";
import { Utils, HeaderSecurity } from "../../utils/utils";
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
  (req, res, next) => Utils.requireAdminKey(req, res, next),
  async (req, res) =>
    await Utils.performAction(req, res, AdminController.getApplication)
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
  (req, res, next) => Utils.requireAdminKey(req, res, next),
  async (req, res) => await Utils.performAction(req, res, resetSecretKey)
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
  (req, res, next) => Utils.requireAdminKey(req, res, next),
  async (req, res) => await Utils.performAction(req, res, getAllApplications)
);

export class AdminController {
  static async getApplication(req, res) {
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
  }

  static async getAllApplications(req, res) {
    let applications = await this.findAllApplications(
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
  }

  static async resetSecretKey(req, res) {
    const { applicationId } = req.params;
    let application = await this.findApplicationById(
      applicationId,
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
  }

  /**
   *
   * @param {ObjectId} id
   * @param {String} selecting
   */
  static async findApplicationById(id, selecting) {
    return await Application.findById(id).select(selecting);
  }

  static async findAllApplications(selecting) {
    return await Application.find().select(selecting);
  }
}

export const AdminRouter = router;
