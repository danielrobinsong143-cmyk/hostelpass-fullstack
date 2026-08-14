import StudentSidebar from "../components/StudentSidebar";
import "../styles/student-layout.css";

function StudentLayout({ children }) {
  return (
    <div className="student-layout">
      <StudentSidebar />

      <main className="student-main">
        {children}
      </main>
    </div>
  );
}

export default StudentLayout;