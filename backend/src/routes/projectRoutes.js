const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
} = require("../controllers/projectController");

const { authenticate } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  createProject
);

router.get(
  "/",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getProjects
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getProjectById
);

module.exports = router;