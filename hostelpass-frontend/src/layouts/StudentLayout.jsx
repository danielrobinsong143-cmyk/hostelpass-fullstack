import { useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import UiIcon from "../components/UiIcon";
import "../styles/student-layout.css";

function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`app-layout student-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <button type="button" className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" aria-expanded={sidebarOpen}><UiIcon name="menu" size={21} /></button>
      {sidebarOpen && <button type="button" className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" />}
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main student-main">{children}</main>
    </div>
  );
}

export default StudentLayout;
