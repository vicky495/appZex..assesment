const express = require("express");

const {
  createMeeting,
  getMeetings,
} = require("../controllers/meetingController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  createMeeting
);

router.get(
  "/project/:projectId",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getMeetings
);

module.exports = router;