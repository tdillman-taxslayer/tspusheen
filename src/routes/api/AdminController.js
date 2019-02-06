import express from "express";
import { performAction } from "../../utils/utils";
import Application from "../../models/Application";

const router = express.Router();

router.get(
  "/applications/:applicationId",
  async (req, res) => await performAction(req, res, getApplication)
);

router.get(
  "/applications/:applicationId/reset",
  async (req, res) => await performAction(req, res, resetSecretKey)
);

router.get(
  "/applications",
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
    "secret_key client_key provider_credentials"
  );
  let resolved = [];
  applications.forEach(application => {
    resolved.push({
      id: application.id,
      secret_key: application.secret_key,
      client_key: application.client_key,
      name: application.name,
      provider_credentials: application.provider_credentials
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
