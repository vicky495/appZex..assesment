const prisma = require("../utils/prisma");

// Create milestone
const createMilestone = async (req, res) => {
  try {
    const { name, description, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Milestone name and projectId are required",
      });
    }

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

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description: description || null,
        projectId: project.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully",
      milestone,
    });
  } catch (error) {
    console.error("Create milestone error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create milestone",
    });
  }
};

// Get milestones of a project
const getMilestones = async (req, res) => {
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

    const milestones = await prisma.milestone.findMany({
      where: {
        projectId: project.id,
      },
      include: {
        task: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      success: true,
      milestones,
    });
  } catch (error) {
    console.error("Get milestones error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch milestones",
    });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      milestoneId,
      priority,
      dueDate,
      assigneeId,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Task title and projectId are required",
      });
    }

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ];

    const taskPriority = priority || "MEDIUM";

    if (!allowedPriorities.includes(taskPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

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

    if (milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: {
          id: Number(milestoneId),
          projectId: project.id,
        },
      });

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: "Milestone not found in this project",
        });
      }
    }

    if (assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: Number(assigneeId),
          agencyId: req.user.agencyId,
          role: {
            in: ["AGENCY_ADMIN", "AGENCY_TEAM"],
          },
        },
      });

      if (!assignee) {
        return res.status(404).json({
          success: false,
          message: "Assignee not found in your agency",
        });
      }
    }

    let parsedDueDate = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: taskPriority,
        dueDate: parsedDueDate,
        projectId: project.id,
        milestoneId: milestoneId ? Number(milestoneId) : null,
        assigneeId: assigneeId ? Number(assigneeId) : null,
      },
      include: {
        milestone: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// Get tasks of a project
const getTasks = async (req, res) => {
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

    const tasks = await prisma.task.findMany({
      where: {
        projectId: project.id,
      },
      include: {
        milestone: true,
        assignee: {
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

    return res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "TODO",
      "IN_PROGRESS",
      "DONE",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          agencyId: req.user.agencyId,
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        status,
      },
    });

    return res.json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

module.exports = {
  createMilestone,
  getMilestones,
  createTask,
  getTasks,
  updateTaskStatus,
};