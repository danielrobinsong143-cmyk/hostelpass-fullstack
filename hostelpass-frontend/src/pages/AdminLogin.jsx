import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import { AuthContext } from "../context/authContextDefinition";
import { adminLogin } from "../services/authService";
import "../styles/login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (error) setError("");
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response = await adminLogin({
        username: formData.username.trim(),
        password: formData.password,
      });

      const { accessToken, principal } = response.data;
      if (principal.role !== "SUPER_ADMIN") {
        setError("Admin access required. Only Super Admins may log in here.");
        return;
      }

      login(accessToken, principal);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      if (!err.response && (err.code === "ERR_NETWORK" || err.message === "Network Error")) {
        setError("Unable to connect to the backend server. Please verify backend is running on port 8081.");
      } else {
        setError(err.response?.data?.message || "Invalid credentials. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page admin-login-page">
      <div className="login-atmosphere" aria-hidden="true" />
      <div className="login-topbar">
        <span className="login-topbar-note">Admin Access Portal</span>
      </div>

      <div className="login-shell">
        <section className="login-hero" aria-label="HostelPass Admin Introduction">
          <div className="brand-lockup brand-lockup-light">
            <span className="brand-mark"><UiIcon name="shield" size={34} strokeWidth={1.55} /></span>
            <span>
              <strong>HostelPass</strong>
              <small>Admin Control Center</small>
            </span>
          </div>

          <div className="login-hero-copy">
            <p className="eyebrow">Authorized Personnel Only</p>
            <h1>Administrative <span>Security &amp; Control.</span></h1>
            <p>Dedicated access portal for system administrators and hostel controllers.</p>
          </div>

          <div className="login-hero-foot">
            <span className="hero-status-dot" />
            <span>Protected with role-based authentication and security audit</span>
          </div>
        </section>

        <section className="login-card" aria-label="Admin Login form">
          <div className="login-card-header">
            <p className="login-card-kicker">Admin Portal</p>
            <h2>Admin Sign In</h2>
            <p>Enter your administrator credentials to access system controls</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label htmlFor="admin-username">Admin Username</label>
              <div className="login-input-wrap">
                <UiIcon name="user" size={18} />
                <input
                  id="admin-username"
                  type="text"
                  name="username"
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="admin-password">Password</label>
              <div className="login-input-wrap">
                <UiIcon name="shield" size={18} />
                <input
                  id="admin-password"
                  type="password"
                  name="password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-btn-spinner" /> Verifying...
                </span>
              ) : (
                <>
                  Login as Admin <UiIcon name="arrow" size={17} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <button
            type="button"
            className="staff-login-button admin-back-button"
            onClick={() => navigate("/")}
          >
            <UiIcon name="arrow" size={17} />
            Return to Main Portal
          </button>

          <p className="login-footer">© 2025 HostelPass. All rights reserved.</p>
        </section>
      </div>
    </div>
  );
}

export default AdminLogin;
