const prisma = require("../utils/prisma");

const createActivityLog = async (req, res) => {
  try {
    const { action, details, projectId } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required",
      });
    }

    // If a project is provided, verify that it belongs
    // to the logged-in user's agency.
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          agencyId: req.user.agencyId,
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found in your agency",
        });
      }
    }

    const activity = await prisma.activityLog.create({
      data: {
        action,
        details: details || null,
        userId: req.user.id,
        projectId: projectId ? Number(projectId) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create activity log",
    });
  }
};


const getProjectActivities = async (req, res) => {
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

    const activities = await prisma.activityLog.findMany({
      where: {
        projectId: project.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};


module.exports = {
  createActivityLog,
  getProjectActivities,
};