const express = require("express");

const {
  createActivityLog,
  getProjectActivities,
} = require("../controllers/activityController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  createActivityLog
);

router.get(
  "/project/:projectId",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getProjectActivities
);

module.exports = router;