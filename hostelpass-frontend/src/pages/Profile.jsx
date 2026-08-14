import "../styles/profile.css";

function Profile() {
  const principal = JSON.parse(localStorage.getItem("principal"));

  if (!principal) {
    return (
      <div className="profile-page">
        <h1>My Profile</h1>
        <p>Student information not available.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View your student information</p>
      </div>

      <div className="profile-card">
        <h2>👤 Personal Information</h2>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Full Name</span>
            <strong>{principal.fullName}</strong>
          </div>

          <div className="profile-item">
            <span>Roll Number</span>
            <strong>{principal.rollNumber}</strong>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <strong>{principal.email}</strong>
          </div>

          <div className="profile-item">
            <span>Mobile Number</span>
            <strong>{principal.mobileNumber}</strong>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h2>🎓 Academic Information</h2>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Department</span>
            <strong>{principal.department}</strong>
          </div>

          <div className="profile-item">
            <span>Branch</span>
            <strong>{principal.branch}</strong>
          </div>

          <div className="profile-item">
            <span>Year of Study</span>
            <strong>{principal.yearOfStudy}</strong>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <h2>🏠 Hostel Information</h2>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Room Number</span>
            <strong>{principal.roomNumber}</strong>
          </div>

          <div className="profile-item">
            <span>Student ID</span>
            <strong>{principal.id}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
