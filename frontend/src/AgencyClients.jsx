import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function AgencyClients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadClients();
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
        error.response?.data?.message || "Failed to load clients"
      );
    }
  };

  const createClient = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await api.post(
        "/api/clients",
        {
          name,
          email,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Client created successfully!");

      setName("");
      setEmail("");
      setPassword("");

      loadClients();
    } catch (error) {
      console.error("Create client error:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create client"
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
        fontFamily: "Arial",
      }}
    >
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "20px 30px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>AppZex SaaS - Clients</h2>

       
  <div style={{ display: "flex", gap: "10px" }}>
  <button
    type="button"
    onClick={() => {
      console.log("Dashboard button clicked");
      navigate("/dashboard");
    }}
    style={{
      padding: "10px 15px",
      cursor: "pointer",
      background: "white",
      color: "#111827",
      border: "none",
      borderRadius: "6px",
    }}
  >
    ← Dashboard
  </button>

  <button
    type="button"
    onClick={() => {
      console.log("Projects button clicked");
      navigate("/agency/projects");
    }}
    style={{
      padding: "10px 15px",
      cursor: "pointer",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
    }}
  >
    Projects
  </button>
</div>
      </header>

      <main
        style={{
          maxWidth: "1000px",
          margin: "30px auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "25px",
          }}
        >
          <h2>Create Client</h2>

          {message && (
            <p
              style={{
                padding: "10px",
                background: "#f3f4f6",
              }}
            >
              {message}
            </p>
          )}

          <form onSubmit={createClient}>
            <input
              placeholder="Client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Client email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Client password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />

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
              {loading ? "Creating..." : "Create Client"}
            </button>
          </form>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
          }}
        >
          <h2>Clients</h2>

          {clients.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                }}
              >
                <strong>{client.name}</strong>
                <p>{client.email}</p>
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
  border: "1px solid #ccc",
  borderRadius: "6px",
};

export default AgencyClients;