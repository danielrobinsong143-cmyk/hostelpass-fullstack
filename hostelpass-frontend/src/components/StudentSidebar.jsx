import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function StudentSidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="student-sidebar">
      <div className="sidebar-logo">
        <h2>HostelPass</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/student/dashboard">
          Dashboard
        </Link>

        <Link to="/student/apply-outpass">
          Apply Outpass
        </Link>

        <Link to="/student/requests">
          My Requests
        </Link>

        <Link to="/student/profile">
          Profile
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default StudentSidebar;
