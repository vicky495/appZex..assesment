import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import api from "./api";
import AgencyDashboard from "./AgencyDashboard";
import AgencyClients from "./AgencyClients";
import ClientPortal from "./ClientPortal";
import AgencyProjects from "./AgencyProjects";
import ProjectDetails from "./ProjectDetails";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "SUPER_ADMIN") {
        setError("Super Admin portal will be added next.");
      } else if (
        data.user.role === "AGENCY_ADMIN" ||
        data.user.role === "AGENCY_TEAM"
      ) {
        navigate("/dashboard");
        } else if (data.user.role === "CLIENT") {
      navigate("/client");
     }else {
        setError("Unknown user role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "35px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#111827",
          }}
        >
          AppZex SaaS
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Project Management Platform
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "25px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: loading ? "#93c5fd" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={<AgencyDashboard />}
      />
      <Route
  path="/agency/clients"
  element={<AgencyClients />}
/>
<Route path="/client" element={<ClientPortal />} />
<Route
  path="/agency/projects"
  element={<AgencyProjects />}
/>
<Route
  path="/agency/projects/:id"
  element={<ProjectDetails />}
/>
    </Routes>
  );
}

export default App;