import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UiIcon from "./UiIcon";
import { AuthContext } from "../context/authContextDefinition";

function StudentSidebar({ isOpen, onClose }) {
  const { logout, principal } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate("/");
  };

  const handleNavigation = () => onClose?.();
  const firstName = principal?.fullName?.split(" ")[0] || "Student";

  return (
    <aside className={`app-sidebar student-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark"><UiIcon name="shield" size={23} strokeWidth={1.6} /></span>
        <span className="sidebar-brand-text">HostelPass</span>
        <button type="button" className="mobile-sidebar-close" onClick={onClose} aria-label="Close navigation menu"><UiIcon name="close" size={19} /></button>
      </div>

      <nav className="sidebar-nav" aria-label="Student navigation">
        <p className="sidebar-section-label">Overview</p>
        <NavLink to="/student/dashboard" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="dashboard" size={18} /><span>Dashboard</span></NavLink>
        <p className="sidebar-section-label">Outpass</p>
        <NavLink to="/student/apply-outpass" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="pass" size={18} /><span>Apply Outpass</span></NavLink>
        <NavLink to="/student/requests" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="requests" size={18} /><span>My Requests</span></NavLink>
        <p className="sidebar-section-label">Account</p>
        <NavLink to="/student/profile" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="profile" size={18} /><span>Profile</span></NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout" onClick={handleLogout}><UiIcon name="logout" size={18} /><span>Logout</span></button>
        <div className="sidebar-profile"><span className="sidebar-profile-avatar">{firstName.charAt(0).toUpperCase()}</span><span><strong>{principal?.fullName || "Student"}</strong><small>Student</small></span><span className="sidebar-profile-chevron">⌄</span></div>
      </div>
    </aside>
  );
}

export default StudentSidebar;
