import { useState } from "react";
import StaffSidebar from "../components/StaffSidebar";
import UiIcon from "../components/UiIcon";
import "../styles/staff-layout.css";

function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-layout staff-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <button type="button" className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" aria-expanded={sidebarOpen}><UiIcon name="menu" size={21} /></button>
      {sidebarOpen && <button type="button" className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" />}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main staff-main">{children}</main>
    </div>
  );
}

export default StaffLayout;
