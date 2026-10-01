const express = require("express");

const {
  getMyProjects,
  getMyProjectById,
} = require("../controllers/clientPortalController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/projects",
  authenticate,
  getMyProjects
);

router.get(
  "/projects/:id",
  authenticate,
  getMyProjectById
);

module.exports = router;