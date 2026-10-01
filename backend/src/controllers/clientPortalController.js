const prisma = require("../utils/prisma");

const getMyProjects = async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({
        success: false,
        message: "Client access required",
      });
    }

    if (!req.user.clientId || !req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "Client account is not properly configured",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        clientId: req.user.clientId,
        agencyId: req.user.agencyId,
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
      projects,
    });
  } catch (error) {
    console.error("Client projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch client projects",
    });
  }
};


const getMyProjectById = async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res.status(403).json({
        success: false,
        message: "Client access required",
      });
    }

    const projectId = Number(req.params.id);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,

        // Client isolation
        clientId: req.user.clientId,

        // Agency isolation
        agencyId: req.user.agencyId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Client project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};


module.exports = {
  getMyProjects,
  getMyProjectById,
};