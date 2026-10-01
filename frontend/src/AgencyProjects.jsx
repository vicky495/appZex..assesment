import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function AgencyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadClients();
    loadProjects();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get("/api/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClients(response.data.clients || []);
    } catch (error) {
      console.error("Failed to load clients:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    }
  };

  const loadProjects = async () => {
    try {
      const response = await api.get("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    }
  };

  const createProject = async (e) => {
    e.preventDefault();

    if (!clientId) {
      setMessage("Please select a client.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post(
        "/api/projects",
        {
          name,
          description,
          clientId: Number(clientId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Project created successfully!");

      setName("");
      setDescription("");
      setClientId("");

      await loadProjects();
    } catch (error) {
      console.error("Create project error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>
          AppZex SaaS - Projects
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>
      </header>

      <main
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "20px",
        }}
      >
        {/* Create Project */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <h2>Create Project</h2>

          {message && (
            <div
              style={{
                background: "#f3f4f6",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={createProject}>
            <input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Project description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="4"
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select client</option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name} ({client.email})
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {loading
                ? "Creating..."
                : "Create Project"}
            </button>
          </form>
        </div>

        {/* Projects */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Projects</h2>

          {projects.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              No projects found.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "15px",
                }}
              >
                <h3
  onClick={() =>
    navigate(`/agency/projects/${project.id}`)
  }
  style={{
    cursor: "pointer",
    color: "#2563eb",
  }}
>
  {project.name}
</h3>

                <p>
                  {project.description ||
                    "No description"}
                </p>

                <p>
                  <strong>Client:</strong>{" "}
                  {project.client?.name || "Unknown"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {project.client?.email || "Unknown"}
                </p>

                <span
                  style={{
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {project.status || "ACTIVE"}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
};

export default AgencyProjects;