import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin, staffLogin } from "../services/authService";
import { AuthContext } from "../context/authContextDefinition";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const [userType, setUserType] = useState("student");

  const [formData, setFormData] = useState({
    rollNumber: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      let response;

      if (userType === "student") {
        response = await studentLogin({
          rollNumber: formData.rollNumber,
          password: formData.password,
        });
      } else {
        response = await staffLogin({
          username: formData.username,
          password: formData.password,
        });
      }

      const { accessToken, principal } = response.data;

      const userWithRole = {
        ...principal,
        role: userType === "student" ? "STUDENT" : principal.role,
      };

      login(accessToken, userWithRole);

      console.log("Access Token Saved");
      console.log(userWithRole);

      // Navigate based on user type
      if (userType === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>HostelPass Management System</h1>

        <p>{userType === "student" ? "Student Login" : "Staff Login"}</p>

        <div className="toggle-buttons">
          <button
            type="button"
            onClick={() => {
              setUserType("student");
              setFormData({
                rollNumber: "",
                username: "",
                password: "",
              });
            }}
          >
            Student
          </button>

          <button
            type="button"
            onClick={() => {
              setUserType("staff");
              setFormData({
                rollNumber: "",
                username: "",
                password: "",
              });
            }}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {userType === "student" ? (
            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
          ) : (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
