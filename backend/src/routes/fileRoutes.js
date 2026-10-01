const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadFile,
  getProjectFiles,
  downloadFile,
} = require("../controllers/fileController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/upload",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  upload.single("file"),
  uploadFile
);

router.get(
  "/project/:projectId",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  getProjectFiles
);

router.get(
  "/:id/download",
  authenticate,
  authorizeRoles("AGENCY_ADMIN", "AGENCY_TEAM"),
  downloadFile
);

module.exports = router;