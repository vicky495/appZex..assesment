import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Milestone form
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskMilestoneId, setTaskMilestoneId] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");

  useEffect(() => {
    fetchProjectData();
    fetchAssignees();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, milestoneResponse, taskResponse] =
        await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/tasks/projects/${id}/milestones`),
          api.get(`/api/tasks/projects/${id}`),
        ]);

      setProject(projectResponse.data.project);
      setMilestones(milestoneResponse.data.milestones || []);
      setTasks(taskResponse.data.tasks || []);
    } catch (error) {
      console.error("Project details error:", error);

      setError(
        error.response?.data?.message || "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch agency users who can be assigned tasks
  const fetchAssignees = async () => {
    try {
      const response = await api.get("/api/agencies/users");

      setAssignees(response.data.users || []);
    } catch (error) {
      console.error("Fetch assignees error:", error);

      // Don't block the whole project page if users cannot be loaded.
      setAssignees([]);
    }
  };

  const createMilestone = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!milestoneName.trim()) {
      setError("Milestone name is required.");
      return;
    }

    try {
      const response = await api.post("/api/tasks/milestones", {
        name: milestoneName,
        description: milestoneDescription,
        projectId: Number(id),
      });

      setMessage(response.data.message);

      setMilestoneName("");
      setMilestoneDescription("");

      await fetchProjectData();
    } catch (error) {
      console.error("Create milestone error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create milestone."
      );
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!taskTitle.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      const response = await api.post("/api/tasks", {
        title: taskTitle,
        description: taskDescription,
        projectId: Number(id),

        milestoneId: taskMilestoneId
          ? Number(taskMilestoneId)
          : null,

        priority: taskPriority,

        dueDate: taskDueDate
          ? taskDueDate
          : null,

        assigneeId: taskAssigneeId
          ? Number(taskAssigneeId)
          : null,
      });

      setMessage(response.data.message);

      setTaskTitle("");
      setTaskDescription("");
      setTaskMilestoneId("");
      setTaskPriority("MEDIUM");
      setTaskDueDate("");
      setTaskAssigneeId("");

      await fetchProjectData();
    } catch (error) {
      console.error("Create task error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create task."
      );
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      setError("");
      setMessage("");

      const response = await api.patch(
        `/api/tasks/${taskId}/status`,
        { status }
      );

      setMessage(response.data.message);

      await fetchProjectData();
    } catch (error) {
      console.error("Update task status error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update task."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString();
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
      },

      MEDIUM: {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      },

      HIGH: {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      },

      URGENT: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      },
    };

    return {
      ...priorityBadgeStyle,
      ...(styles[priority] || styles.MEDIUM),
    };
  };

  if (loading) {
    return (
      <p style={{ padding: "30px" }}>
        Loading project...
      </p>
    );
  }

  if (error && !project) {
    return (
      <div style={{ padding: "30px" }}>
        <button
          onClick={() => navigate("/agency/projects")}
          style={buttonStyle}
        >
          ← Projects
        </button>

        <h2>Error</h2>

        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <p style={{ padding: "30px" }}>
        Project not found.
      </p>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>
            AppZex SaaS
          </h1>

          <p
            style={{
              margin: "5px 0 0",
              color: "#9ca3af",
            }}
          >
            Project Workspace
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
        >
          Logout
        </button>
      </header>

      <main style={mainStyle}>
        {/* Back */}
        <button
          onClick={() => navigate("/agency/projects")}
          style={buttonStyle}
        >
          ← Projects
        </button>

        {/* Messages */}
        {message && (
          <div style={successStyle}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* Project information */}
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>
                {project.name}
              </h2>

              <p style={{ color: "#6b7280" }}>
                {project.description ||
                  "No description provided."}
              </p>
            </div>

            <span style={statusStyle}>
              {project.status}
            </span>
          </div>

          <hr style={{ margin: "25px 0" }} />

          <h3>Client</h3>

          <p>
            <strong>Name:</strong>{" "}
            {project.client?.name || "N/A"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {project.client?.email || "N/A"}
          </p>
        </section>

        {/* Milestones */}
        <section style={cardStyle}>
          <h2>Milestones</h2>

          <form onSubmit={createMilestone}>
            <input
              type="text"
              placeholder="Milestone name"
              value={milestoneName}
              onChange={(e) =>
                setMilestoneName(e.target.value)
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Milestone description"
              value={milestoneDescription}
              onChange={(e) =>
                setMilestoneDescription(e.target.value)
              }
              style={textareaStyle}
            />

            <button
              type="submit"
              style={primaryButtonStyle}
            >
              + Create Milestone
            </button>
          </form>

          <div style={{ marginTop: "25px" }}>
            {milestones.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No milestones created yet.
              </p>
            ) : (
              milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  style={itemStyle}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {milestone.name}
                  </h3>

                  <p
                    style={{
                      color: "#6b7280",
                    }}
                  >
                    {milestone.description ||
                      "No description"}
                  </p>

                  <small>
                    Tasks:{" "}
                    {milestone.tasks?.length || 0}
                  </small>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tasks */}
        <section style={cardStyle}>
          <h2>Tasks</h2>

          <form onSubmit={createTask}>
            {/* Task title */}
            <input
              type="text"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) =>
                setTaskTitle(e.target.value)
              }
              style={inputStyle}
            />

            {/* Task description */}
            <textarea
              placeholder="Task description"
              value={taskDescription}
              onChange={(e) =>
                setTaskDescription(e.target.value)
              }
              style={textareaStyle}
            />

            {/* Milestone */}
            <label style={labelStyle}>
              Milestone
            </label>

            <select
              value={taskMilestoneId}
              onChange={(e) =>
                setTaskMilestoneId(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                No milestone
              </option>

              {milestones.map((milestone) => (
                <option
                  key={milestone.id}
                  value={milestone.id}
                >
                  {milestone.name}
                </option>
              ))}
            </select>

            {/* Priority */}
            <label style={labelStyle}>
              Priority
            </label>

            <select
              value={taskPriority}
              onChange={(e) =>
                setTaskPriority(e.target.value)
              }
              style={inputStyle}
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="URGENT">
                Urgent
              </option>
            </select>

            {/* Due date */}
            <label style={labelStyle}>
              Due Date
            </label>

            <input
              type="date"
              value={taskDueDate}
              onChange={(e) =>
                setTaskDueDate(e.target.value)
              }
              style={inputStyle}
            />

            {/* Assignee */}
            <label style={labelStyle}>
              Assign To
            </label>

            <select
              value={taskAssigneeId}
              onChange={(e) =>
                setTaskAssigneeId(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Unassigned
              </option>

              {assignees.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} ({user.role})
                </option>
              ))}
            </select>

            {assignees.length === 0 && (
              <small
                style={{
                  display: "block",
                  color: "#6b7280",
                  marginTop: "-5px",
                  marginBottom: "12px",
                }}
              >
                No agency team members available.
              </small>
            )}

            <button
              type="submit"
              style={primaryButtonStyle}
            >
              + Create Task
            </button>
          </form>

          {/* Task list */}
          <div style={{ marginTop: "25px" }}>
            {tasks.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No tasks created yet.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  style={itemStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: "0 0 8px",
                        }}
                      >
                        {task.title}
                      </h3>

                      <p
                        style={{
                          color: "#6b7280",
                          margin: "0 0 12px",
                        }}
                      >
                        {task.description ||
                          "No description"}
                      </p>

                      {/* Task metadata */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        <span
                          style={getPriorityStyle(
                            task.priority
                          )}
                        >
                          {task.priority || "MEDIUM"}
                        </span>

                        <span
                          style={metadataBadgeStyle}
                        >
                          Due:{" "}
                          {formatDate(task.dueDate)}
                        </span>

                        <span
                          style={metadataBadgeStyle}
                        >
                          {task.assignee
                            ? `Assigned: ${task.assignee.name}`
                            : "Unassigned"}
                        </span>
                      </div>

                      {task.milestone && (
                        <small
                          style={{
                            display: "block",
                            color: "#4b5563",
                          }}
                        >
                          Milestone:{" "}
                          {task.milestone.name}
                        </small>
                      )}

                      {task.assignee && (
                        <small
                          style={{
                            display: "block",
                            color: "#6b7280",
                            marginTop: "5px",
                          }}
                        >
                          Assignee email:{" "}
                          {task.assignee.email}
                        </small>
                      )}
                    </div>

                    {/* Status */}
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(
                          task.id,
                          e.target.value
                        )
                      }
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border:
                          "1px solid #d1d5db",
                        minWidth: "125px",
                      }}
                    >
                      <option value="TODO">
                        TODO
                      </option>

                      <option value="IN_PROGRESS">
                        IN PROGRESS
                      </option>

                      <option value="DONE">
                        DONE
                      </option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Remaining modules */}
        <section style={cardStyle}>
          <h2>Project Management</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <button style={disabledButtonStyle}>
              Meetings
            </button>

            <button style={disabledButtonStyle}>
              Feedback / Change Requests
            </button>

            <button style={disabledButtonStyle}>
              Files
            </button>

            <button style={disabledButtonStyle}>
              AI Project Summary
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f3f4f6",
  fontFamily: "Arial, sans-serif",
};

const headerStyle = {
  backgroundColor: "#111827",
  color: "white",
  padding: "18px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const mainStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "30px",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  marginTop: "25px",
};

const itemStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "18px",
  marginTop: "12px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px",
  marginBottom: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "90px",
  resize: "vertical",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "6px",
  color: "#374151",
};

const buttonStyle = {
  padding: "9px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "white",
  cursor: "pointer",
};

const primaryButtonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const logoutButtonStyle = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "6px",
  cursor: "pointer",
};

const disabledButtonStyle = {
  padding: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#f9fafb",
  color: "#6b7280",
};

const statusStyle = {
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  padding: "7px 12px",
  borderRadius: "20px",
  fontWeight: "600",
};

const priorityBadgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "15px",
  fontSize: "12px",
  fontWeight: "600",
};

const metadataBadgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "15px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  fontSize: "12px",
};

const successStyle = {
  marginTop: "20px",
  padding: "12px",
  backgroundColor: "#dcfce7",
  color: "#166534",
  borderRadius: "6px",
};

const errorStyle = {
  marginTop: "20px",
  padding: "12px",
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  borderRadius: "6px",
};

export default ProjectDetails;