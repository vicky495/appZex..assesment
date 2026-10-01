const express = require("express");

const {
  generateProjectSummary,
} = require("../controllers/aiController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/projects/:projectId/summary",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  generateProjectSummary
);

module.exports = router;