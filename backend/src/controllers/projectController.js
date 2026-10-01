const prisma = require("../utils/prisma");

const createProject = async (req, res) => {
  try {
    const { name, description, clientId } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Project name and clientId are required",
      });
    }

    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with an agency",
      });
    }

    // IMPORTANT:
    // Check that the client belongs to the logged-in user's agency.
    const client = await prisma.client.findFirst({
      where: {
        id: Number(clientId),
        agencyId: req.user.agencyId,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found in your agency",
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        agencyId: req.user.agencyId,
        clientId: client.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};


const getProjects = async (req, res) => {
  try {
    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with an agency",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
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
    console.error("Get projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


const getProjectById = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with an agency",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,

        // CRITICAL TENANT CHECK
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
    console.error("Get project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
};