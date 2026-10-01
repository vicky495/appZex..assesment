const express = require("express");

const {
  createAgency,
  getAgencies,
  updateAgencyStatus,
} = require("../controllers/agencyController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("SUPER_ADMIN"));

router.post("/", createAgency);

router.get("/", getAgencies);

router.patch("/:id/status", updateAgencyStatus);

module.exports = router;