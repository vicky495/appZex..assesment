import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function AgencyDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    tasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (
        parsedUser.role !== "AGENCY_ADMIN" &&
        parsedUser.role !== "AGENCY_TEAM"
      ) {
        navigate("/");
        return;
      }

      setUser(parsedUser);
      loadDashboard();
    } catch (err) {
      console.error("User parsing error:", err);
      navigate("/");
    }
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [clientsResponse, projectsResponse] = await Promise.all([
        api.get("/api/clients"),
        api.get("/api/projects"),
      ]);

      setStats({
        clients: clientsResponse.data.clients?.length || 0,
        projects: projectsResponse.data.projects?.length || 0,
        tasks: 0,
      });
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
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
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>AppZex SaaS</h1>
          <p style={styles.subtitle}>Agency Workspace</p>
        </div>

        <div style={styles.headerRight}>
          <span>
            {user?.name || "Agency User"}
          </span>

          <button
            type="button"
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.welcome}>
          <h2>
            Welcome, {user?.name || "Agency User"}
          </h2>

          <p style={styles.muted}>
            Manage your agency clients, projects and tasks.
          </p>
        </section>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Clients</h3>
            <p style={styles.statNumber}>
              {loading ? "..." : stats.clients}
            </p>

            <button
              type="button"
              onClick={() => navigate("/agency/clients")}
              style={styles.primaryButton}
            >
              Manage Clients
            </button>
          </div>

          <div style={styles.statCard}>
            <h3>Projects</h3>
            <p style={styles.statNumber}>
              {loading ? "..." : stats.projects}
            </p>

            <button
              type="button"
              onClick={() => navigate("/agency/projects")}
              style={styles.primaryButton}
            >
              View Projects
            </button>
          </div>

          <div style={styles.statCard}>
            <h3>Tasks</h3>
            <p style={styles.statNumber}>
              {loading ? "..." : stats.tasks}
            </p>

            <button
              type="button"
              onClick={() => navigate("/agency/projects")}
              style={styles.secondaryButton}
            >
              Manage Tasks
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <h2>Quick Actions</h2>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/agency/clients")}
              style={styles.primaryButton}
            >
              + Manage Clients
            </button>

            <button
              type="button"
              onClick={() => navigate("/agency/projects")}
              style={styles.primaryButton}
            >
              + Manage Projects
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    backgroundColor: "#111827",
    color: "white",
    padding: "18px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    margin: 0,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#9ca3af",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  logoutButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
  },

  welcome: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    margin: "15px 0",
    color: "#111827",
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  actions: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#374151",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  muted: {
    color: "#6b7280",
  },
};

export default AgencyDashboard;