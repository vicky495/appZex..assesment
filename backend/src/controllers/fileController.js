const fs = require("fs");
const path = require("path");
const prisma = require("../utils/prisma");

const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    // Verify project belongs to logged-in agency
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        agencyId: req.user.agencyId,
      },
    });

    if (!project) {
      // Delete uploaded file if project is invalid
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const file = await prisma.file.create({
      data: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        projectId: project.id,
        uploadedBy: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        id: file.id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        projectId: file.projectId,
      },
    });
  } catch (error) {
    console.error("Upload file error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
};


const getProjectFiles = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        agencyId: req.user.agencyId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const files = await prisma.file.findMany({
      where: {
        projectId: project.id,
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        size: true,
        projectId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
    });
  }
};


const downloadFile = async (req, res) => {
  try {
    const fileId = Number(req.params.id);

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        project: {
          agencyId: req.user.agencyId,
        },
      },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Physical file not found",
      });
    }

    res.download(
      path.resolve(file.filePath),
      file.fileName
    );
  } catch (error) {
    console.error("Download file error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
};


module.exports = {
  uploadFile,
  getProjectFiles,
  downloadFile,
};