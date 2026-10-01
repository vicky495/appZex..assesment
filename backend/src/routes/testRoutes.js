const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  authorizeRoles("AGENCY_TEAM", "AGENCY_ADMIN", "SUPER_ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Role authorization working",
      user: req.user,
    });
  }
);

module.exports = router;