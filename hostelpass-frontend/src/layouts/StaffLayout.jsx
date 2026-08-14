import StaffSidebar from "../components/StaffSidebar";
import "../styles/staff-layout.css";

function StaffLayout({ children }) {
  return (
    <div className="staff-layout">
      <StaffSidebar />

      <main className="staff-main">
        {children}
      </main>
    </div>
  );
}

export default StaffLayout;