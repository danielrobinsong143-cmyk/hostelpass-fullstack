import "../styles/StaffProfile.css";

function StaffProfile() {
  const principal = JSON.parse(localStorage.getItem("principal"));

  if (!principal) {
    return (
      <div className="staff-profile-page">
        <div className="staff-profile-header">
          <span>STAFF PROFILE</span>
          <h1>Profile</h1>
          <p>Staff information is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-profile-page">

      {/* Header */}
      <div className="staff-profile-header">
        <span>STAFF PROFILE</span>
        <h1>My Profile</h1>
        <p>View your staff account information.</p>
      </div>

      {/* Personal Information */}
      <div className="staff-profile-card">
        <h2>👤 Personal Information</h2>

        <div className="staff-profile-grid">

          <div className="staff-profile-item">
            <span>Full Name</span>
            <strong>{principal.fullName || "—"}</strong>
          </div>

          <div className="staff-profile-item">
            <span>Email</span>
            <strong>{principal.email || "—"}</strong>
          </div>

          <div className="staff-profile-item">
            <span>Mobile Number</span>
            <strong>{principal.mobileNumber || "—"}</strong>
          </div>

          <div className="staff-profile-item">
            <span>Staff ID</span>
            <strong>{principal.id || "—"}</strong>
          </div>

        </div>
      </div>

      {/* Role Information */}
      <div className="staff-profile-card">
        <h2>🛡️ Role Information</h2>

        <div className="staff-profile-grid">

          <div className="staff-profile-item">
            <span>Role</span>
            <strong>{principal.role || "—"}</strong>
          </div>

          <div className="staff-profile-item">
            <span>Account Status</span>
            <strong>Active</strong>
          </div>

        </div>
      </div>

    </div>
  );
}

export default StaffProfile;