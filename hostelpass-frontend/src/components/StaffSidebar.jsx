import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import UiIcon from "./UiIcon";
import { AuthContext } from "../context/authContextDefinition";

function StaffSidebar({ isOpen, onClose }) {
  const { logout, principal } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate("/");
  };

  const handleNavigation = () => onClose?.();
  const firstName = principal?.fullName?.split(" ")[0] || "Staff";
  const roleLabel = principal?.role?.replaceAll("_", " ") || "Staff";

  return (
    <aside className={`app-sidebar staff-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark"><UiIcon name="shield" size={23} strokeWidth={1.6} /></span>
        <span className="sidebar-brand-text">HostelPass</span>
        <button type="button" className="mobile-sidebar-close" onClick={onClose} aria-label="Close navigation menu"><UiIcon name="close" size={19} /></button>
      </div>

      <nav className="sidebar-nav" aria-label="Staff navigation">
        <p className="sidebar-section-label">Overview</p>
        <NavLink
          to={principal?.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/staff/dashboard"}
          onClick={handleNavigation}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <UiIcon name="dashboard" size={18} />
          <span>Dashboard</span>
        </NavLink>
        <p className="sidebar-section-label">Management</p>
        <NavLink to="/staff/requests" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="requests" size={18} /><span>Outpass Requests</span></NavLink>
        {principal?.role === "SUPER_ADMIN" && (
          <>
            <p className="sidebar-section-label">Administration</p>
            <NavLink to="/admin/students" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="users" size={18} /><span>Students</span></NavLink>
            <NavLink to="/admin/staff" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="shield" size={18} /><span>Staff</span></NavLink>
          </>
        )}
        <p className="sidebar-section-label">Account</p>
        <NavLink to="/staff/profile" onClick={handleNavigation} className={({ isActive }) => isActive ? "active" : ""}><UiIcon name="profile" size={18} /><span>Profile</span></NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout" onClick={handleLogout}><UiIcon name="logout" size={18} /><span>Logout</span></button>
        <div className="sidebar-profile"><span className="sidebar-profile-avatar sidebar-profile-avatar-staff">{firstName.charAt(0).toUpperCase()}</span><span><strong>{principal?.fullName || "Staff member"}</strong><small>{roleLabel}</small></span><span className="sidebar-profile-chevron">⌄</span></div>
      </div>
    </aside>
  );
}

export default StaffSidebar;
