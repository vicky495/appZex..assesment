const prisma = require("../utils/prisma");

const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      meetingDate,
      projectId,
    } = req.body;

    if (!title || !meetingDate || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title, meetingDate and projectId are required",
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

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        meetingDate: new Date(meetingDate),
        projectId: project.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create meeting",
    });
  }
};

const getMeetings = async (req, res) => {
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

    const meetings = await prisma.meeting.findMany({
      where: {
        projectId: project.id,
      },
      orderBy: {
        meetingDate: "desc",
      },
    });

    res.json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("Get meetings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meetings",
    });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
};