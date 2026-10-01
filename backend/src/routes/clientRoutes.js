const express = require("express");

const {
  createClient,
  getClients,
} = require("../controllers/clientController");

const { authenticate } = require("../middleware/authMiddleware");

const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);

// Get clients belonging to logged-in agency
router.get(
  "/",
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getClients
);

// Create client
router.post(
  "/",
  authorizeRoles("AGENCY_ADMIN"),
  createClient
);

module.exports = router;