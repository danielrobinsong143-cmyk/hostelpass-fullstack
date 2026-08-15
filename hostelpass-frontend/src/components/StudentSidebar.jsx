import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function StudentSidebar({ isOpen, onClose }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate("/");
  };

  const handleNavigation = () => {
    onClose?.();
  };

  return (
    <aside className={`student-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <h2>HostelPass</h2>

        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          ×
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link to="/student/dashboard" onClick={handleNavigation}>
          Dashboard
        </Link>

        <Link to="/student/apply-outpass" onClick={handleNavigation}>
          Apply Outpass
        </Link>

        <Link to="/student/requests" onClick={handleNavigation}>
          My Requests
        </Link>

        <Link to="/student/profile" onClick={handleNavigation}>
          Profile
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default StudentSidebar;
