import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";

function StaffSidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="staff-sidebar">
      <div className="sidebar-logo">
        <h2>HostelPass</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/staff/dashboard">Dashboard</Link>

        <Link to="/staff/requests">Outpass Requests</Link>

        <Link to="/staff/profile">Profile</Link>
      </nav>

      <div className="sidebar-bottom">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default StaffSidebar;
