const express = require("express");

const {
  createMilestone,
  getMilestones,
  createTask,
  getTasks,
  updateTaskStatus,
} = require("../controllers/taskController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

const agencyRoles = [
  "AGENCY_ADMIN",
  "AGENCY_TEAM",
];

// Milestones
router.post(
  "/milestones",
  authenticate,
  authorizeRoles(...agencyRoles),
  createMilestone
);

router.get(
  "/projects/:projectId/milestones",
  authenticate,
  authorizeRoles(...agencyRoles),
  getMilestones
);

// Tasks
router.post(
  "/",
  authenticate,
  authorizeRoles(...agencyRoles),
  createTask
);

router.get(
  "/projects/:projectId",
  authenticate,
  authorizeRoles(...agencyRoles),
  getTasks
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(...agencyRoles),
  updateTaskStatus
);

module.exports = router;