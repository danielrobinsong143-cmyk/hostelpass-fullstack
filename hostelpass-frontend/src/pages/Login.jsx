import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import { AuthContext } from "../context/authContextDefinition";
import { staffLogin, studentLogin } from "../services/authService";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({ rollNumber: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchUserType = () => {
    setUserType((previous) => (previous === "student" ? "staff" : "student"));
    setError("");
    setFormData({ rollNumber: "", username: "", password: "" });
  };

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
      const response = userType === "student"
        ? await studentLogin({ rollNumber: formData.rollNumber.trim(), password: formData.password })
        : await staffLogin({ username: formData.username.trim(), password: formData.password });
      const { accessToken, principal } = response.data;
      const userWithRole = { ...principal, role: userType === "student" ? "STUDENT" : principal.role };
      login(accessToken, userWithRole);
      navigate(userType === "student" ? "/student/dashboard" : "/staff/dashboard");
    } catch (err) {
      console.error("Login error:", err);
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
    <div className="login-page">
      <div className="login-atmosphere" aria-hidden="true" />
      <div className="login-topbar">
        <span className="login-topbar-note">Outpass management system</span>
      </div>

      <div className="login-shell">
        <section className="login-hero" aria-label="HostelPass introduction">
          <div className="brand-lockup brand-lockup-light">
            <span className="brand-mark"><UiIcon name="shield" size={34} strokeWidth={1.55} /></span>
            <span>
              <strong>HostelPass</strong>
              <small>Outpass Management System</small>
            </span>
          </div>

          <div className="login-hero-copy">
            <p className="eyebrow">Campus life, simplified</p>
            <h1>Secure. Simple. <span>Seamless.</span></h1>
            <p>Manage hostel outpasses with efficiency and transparency.</p>
          </div>

          <div className="login-hero-foot">
            <span className="hero-status-dot" />
            <span>Trusted by students and hostel administration</span>
          </div>
        </section>

        <section className="login-card" aria-label="Login form">
          <div className="login-card-header">
            <p className="login-card-kicker">{userType === "student" ? "Student portal" : "Staff portal"}</p>
            <h2>Welcome Back!</h2>
            <p>Login to continue to HostelPass</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label htmlFor={userType === "student" ? "rollNumber" : "username"}>
                {userType === "student" ? "Email / Username" : "Username"}
              </label>
              <div className="login-input-wrap">
                <UiIcon name="user" size={18} />
                <input
                  id={userType === "student" ? "rollNumber" : "username"}
                  type="text"
                  name={userType === "student" ? "rollNumber" : "username"}
                  placeholder={userType === "student" ? "Enter your email or username" : "Enter your staff username"}
                  value={userType === "student" ? formData.rollNumber : formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <UiIcon name="shield" size={18} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <span className="login-input-trailing"><UiIcon name="eye" size={17} /></span>
              </div>
            </div>

            <button type="button" className="forgot-password-button" onClick={() => setError("Password recovery is handled by your hostel administrator.")}>
              Forgot Password?
            </button>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? <span className="login-btn-loading"><span className="login-btn-spinner" /> Signing In...</span> : <>Login <UiIcon name="arrow" size={17} /></>}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <button type="button" className="staff-login-button" onClick={switchUserType}>
            <UiIcon name="profile" size={18} />
            {userType === "student" ? "Login as Staff" : "Login as Student"}
          </button>

          <p className="login-footer">© 2025 HostelPass. All rights reserved.</p>
        </section>
      </div>
    </div>
  );
}

export default Login;
