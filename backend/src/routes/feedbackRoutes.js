const express = require("express");

const {
  createFeedback,
  getMyFeedback,
  getProjectFeedback,
  updateFeedbackStatus,
} = require("../controllers/feedbackController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Client
router.post(
  "/",
  authenticate,
  createFeedback
);

router.get(
  "/my",
  authenticate,
  getMyFeedback
);

// Agency
router.get(
  "/project/:projectId",
  authenticate,
  getProjectFeedback
);

router.patch(
  "/:id/status",
  authenticate,
  updateFeedbackStatus
);

module.exports = router;