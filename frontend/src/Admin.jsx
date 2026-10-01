import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Admin() {
  const navigate = useNavigate();

  const [agencies, setAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  const [form, setForm] = useState({
    agencyName: "",
    slug: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load agencies
  const fetchAgencies = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/agencies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAgencies(response.data.agencies || []);
    } catch (error) {
      console.error("Fetch agencies error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load agencies."
      );
    } finally {
      setLoadingAgencies(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "SUPER_ADMIN") {
      navigate("/");
      return;
    }

    fetchAgencies();
  }, [navigate]);

  // Form change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create agency
  const handleCreateAgency = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/api/agencies",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);

      setForm({
        agencyName: "",
        slug: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });

      // Refresh agency list
      await fetchAgencies();
    } catch (error) {
      console.error("Create agency error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create agency."
      );
    } finally {
      setLoading(false);
    }
  };

  // Suspend / activate
  const handleStatusChange = async (
    agencyId,
    currentStatus
  ) => {
    try {
      const token = localStorage.getItem("token");

      await api.patch(
        `/api/agencies/${agencyId}/status`,
        {
          isActive: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchAgencies();
    } catch (error) {
      console.error(
        "Agency status error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update agency status."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundColor: "#111827",
          color: "white",
          padding: "18px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
            Super Admin Portal
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <h2>Agency Management</h2>

        <p style={{ color: "#6b7280" }}>
          Manage all agencies on the AppZex platform.
        </p>

        {/* MESSAGES */}
        {message && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

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

        {/* CREATE AGENCY */}
        <section
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h3>Create New Agency</h3>

          <form onSubmit={handleCreateAgency}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <Input
                label="Agency Name"
                name="agencyName"
                value={form.agencyName}
                onChange={handleChange}
                placeholder="Example Agency"
              />

              <Input
                label="Agency Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="example-agency"
              />

              <Input
                label="Admin Name"
                name="adminName"
                value={form.adminName}
                onChange={handleChange}
                placeholder="John Doe"
              />

              <Input
                label="Admin Email"
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={handleChange}
                placeholder="admin@example.com"
              />

              <Input
                label="Admin Password"
                name="adminPassword"
                type="password"
                value={form.adminPassword}
                onChange={handleChange}
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "25px",
                padding: "12px 25px",
                backgroundColor: loading
                  ? "#93c5fd"
                  : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "7px",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Creating..."
                : "Create Agency"}
            </button>
          </form>
        </section>

        {/* AGENCY LIST */}
        <section
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3>All Agencies</h3>

          {loadingAgencies ? (
            <p>Loading agencies...</p>
          ) : agencies.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              No agencies found.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Agency</th>
                    <th style={thStyle}>Slug</th>
                    <th style={thStyle}>Admin</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {agencies.map((agency) => {
                    const admin = agency.user?.find(
                   (user) =>
                  user.role === "AGENCY_ADMIN"
                      );

                    return (
                      <tr key={agency.id}>
                        <td style={tdStyle}>
                          {agency.id}
                        </td>

                        <td style={tdStyle}>
                          <strong>
                            {agency.name}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {agency.slug}
                        </td>

                        <td style={tdStyle}>
                          {admin
                            ? admin.email
                            : "No admin"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              padding:
                                "5px 10px",
                              borderRadius: "20px",
                              backgroundColor:
                                agency.isActive
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              color:
                                agency.isActive
                                  ? "#166534"
                                  : "#991b1b",
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {agency.isActive
                              ? "Active"
                              : "Suspended"}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                agency.id,
                                agency.isActive
                              )
                            }
                            style={{
                              padding:
                                "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              backgroundColor:
                                agency.isActive
                                  ? "#dc2626"
                                  : "#16a34a",
                              color: "white",
                            }}
                          >
                            {agency.isActive
                              ? "Suspend"
                              : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "7px",
        }}
      />
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #e5e7eb",
};

export default Admin;