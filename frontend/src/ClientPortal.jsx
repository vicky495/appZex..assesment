import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function ClientPortal() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.get("/api/client-portal/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Client portal error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load client projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
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
        <div>
          <h2 style={{ margin: 0 }}>AppZex SaaS</h2>
          <p style={{ margin: "5px 0 0", color: "#d1d5db" }}>
            Client Portal
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <h1>Welcome, {user.name || "Client"} 👋</h1>

          <p style={{ color: "#6b7280" }}>
            View your projects and project progress from here.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
            }}
          >
            Loading projects...
          </div>
        ) : (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <h2>Your Projects</h2>

            {projects.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No projects have been assigned to you yet.
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
                  <h3 style={{ marginTop: 0 }}>
                    {project.name}
                  </h3>

                  <p style={{ color: "#6b7280" }}>
                    {project.description || "No description available."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                      }}
                    >
                      Status: {project.status}
                    </span>

                    <span
                      style={{
                        background: "#f3f4f6",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                      }}
                    >
                      Project ID: {project.id}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientPortal;