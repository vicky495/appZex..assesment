const prisma = require("../utils/prisma");

// Client submits feedback
const createFeedback = async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({
        success: false,
        message: "Only clients can submit feedback",
      });
    }

    const { message, projectId } = req.body;

    if (!message || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Message and projectId are required",
      });
    }

    // Verify that this project belongs to this client
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        clientId: req.user.clientId,
        agencyId: req.user.agencyId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        message,
        projectId: project.id,
        clientId: req.user.clientId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
};


// Client views own feedback
const getMyFeedback = async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({
        success: false,
        message: "Client access required",
      });
    }

    const feedback = await prisma.feedback.findMany({
      where: {
        clientId: req.user.clientId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Get client feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
};


// Agency views feedback for a project
const getProjectFeedback = async (req, res) => {
  try {
    if (
      req.user.role !== "AGENCY_ADMIN" &&
      req.user.role !== "AGENCY_TEAM"
    ) {
      return res.status(403).json({
        success: false,
        message: "Agency access required",
      });
    }

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

    const feedback = await prisma.feedback.findMany({
      where: {
        projectId: project.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Get project feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
    });
  }
};


// Agency updates feedback status
const updateFeedbackStatus = async (req, res) => {
  try {
    if (
      req.user.role !== "AGENCY_ADMIN" &&
      req.user.role !== "AGENCY_TEAM"
    ) {
      return res.status(403).json({
        success: false,
        message: "Agency access required",
      });
    }

    const feedbackId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "IN_REVIEW",
      "RESOLVED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback status",
      });
    }

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        project: {
          agencyId: req.user.agencyId,
        },
      },
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: {
        id: feedback.id,
      },
      data: {
        status,
      },
    });

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Update feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
    });
  }
};


module.exports = {
  createFeedback,
  getMyFeedback,
  getProjectFeedback,
  updateFeedbackStatus,
};