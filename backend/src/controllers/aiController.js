const OpenAI = require("openai");
const prisma = require("../utils/prisma");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateProjectSummary = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (!req.user.agencyId) {
      return res.status(403).json({
        success: false,
        message: "Agency access required",
      });
    }

    // Tenant-isolated project lookup
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        agencyId: req.user.agencyId,
      },
      include: {
        milestones: {
          include: {
            tasks: true,
          },
        },
        tasks: true,
        meetings: true,
        feedbacks: true,
        client: {
          select: {
            name: true,
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

    const taskCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    project.tasks.forEach((task) => {
      taskCounts[task.status]++;
    });

    const openFeedback = project.feedbacks.filter(
      (feedback) => feedback.status !== "RESOLVED"
    );

    const projectContext = {
      projectName: project.name,
      description: project.description,
      status: project.status,
      client: project.client.name,

      tasks: {
        total: project.tasks.length,
        todo: taskCounts.TODO,
        inProgress: taskCounts.IN_PROGRESS,
        completed: taskCounts.DONE,
      },

      milestones: project.milestones.map((milestone) => ({
        name: milestone.name,
        description: milestone.description,
        tasks: milestone.tasks.length,
      })),

      meetings: project.meetings.map((meeting) => ({
        title: meeting.title,
        date: meeting.meetingDate,
      })),

      feedback: {
        total: project.feedbacks.length,
        unresolved: openFeedback.length,
        messages: openFeedback.map((feedback) => feedback.message),
      },
    };

    const prompt = `
You are a project management assistant.

Analyze the following real project data and provide a concise project health summary.

PROJECT DATA:
${JSON.stringify(projectContext, null, 2)}

Return the response with these sections:

Project Health:
Summary:
Task Progress:
Risks:
Recommended Actions:

Do not invent information that is not present in the project data.
`;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    const summary = response.output_text;

    res.json({
      success: true,
      projectId: project.id,
      projectName: project.name,
      summary,
    });
  } catch (error) {
    console.error("AI project summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI project summary",
    });
  }
};

module.exports = {
  generateProjectSummary,
};