import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function StaffSidebar({ isOpen, onClose }) {
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
    <aside className={`staff-sidebar ${isOpen ? "open" : ""}`}>
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
        <Link to="/staff/dashboard" onClick={handleNavigation}>
          Dashboard
        </Link>

        <Link to="/staff/requests" onClick={handleNavigation}>
          Outpass Requests
        </Link>

        <Link to="/staff/profile" onClick={handleNavigation}>
          Profile
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default StaffSidebar;
