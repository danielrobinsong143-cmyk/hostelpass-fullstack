import { useState } from "react";
import UiIcon from "../components/UiIcon";
import { changeAdminOwnPassword } from "../services/adminAdminService";
import "../styles/AdminProfile.css";

const INITIAL_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminProfile() {
  const principal = JSON.parse(localStorage.getItem("principal"));

  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visibility toggles for the 3 password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(passwordForm.newPassword)) {
      errors.newPassword = "Password must contain at least one letter and one number";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Password confirmation is required";
    } else if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      errors.newPassword = "New password cannot be the same as the current password";
    }

    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await changeAdminOwnPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setSuccessMessage("Your password has been changed successfully. Other active refresh sessions have been revoked.");
      setPasswordForm(INITIAL_PASSWORD_FORM);
      setFormErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Change password error:", err);
      setServerError(
        err.response?.data?.message ||
        err.message ||
        "Failed to change password. Please check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!principal) {
    return (
      <div className="admin-profile-page">
        <div className="admin-profile-header">
          <span>ADMINISTRATION</span>
          <h1>Admin Profile</h1>
          <p>Administrator account information is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <div className="admin-profile-header">
        <span>ADMINISTRATION</span>
        <h1>Admin Profile</h1>
        <p>Manage your administrator account credentials and personal information.</p>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="admin-profile-banner admin-profile-banner-success" role="alert">
          <div className="admin-profile-banner-content">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className="admin-profile-banner-close"
            onClick={() => setSuccessMessage("")}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {serverError && (
        <div className="admin-profile-banner admin-profile-banner-error" role="alert">
          <div className="admin-profile-banner-content">
            <span>⚠️</span>
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            className="admin-profile-banner-close"
            onClick={() => setServerError("")}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Personal Information */}
      <div className="admin-profile-card">
        <div className="admin-profile-card-header">
          <div>
            <h2>
              <UiIcon name="profile" size={20} />
              Personal Information
            </h2>
            <p>Your administrator profile details registered in HostelPass</p>
          </div>
        </div>

        <div className="admin-profile-grid">
          <div className="admin-profile-item">
            <span>Full Name</span>
            <strong>{principal.fullName || "—"}</strong>
          </div>

          <div className="admin-profile-item">
            <span>Username</span>
            <strong className="mono">@{principal.username || "—"}</strong>
          </div>

          <div className="admin-profile-item">
            <span>Email Address</span>
            <strong>{principal.email || "—"}</strong>
          </div>

          <div className="admin-profile-item">
            <span>Mobile Number</span>
            <strong>{principal.mobileNumber || "—"}</strong>
          </div>

          <div className="admin-profile-item">
            <span>Administrative Role</span>
            <div>
              <span className="staff-role-badge staff-role-super-admin">
                🛡️ Super Admin
              </span>
            </div>
          </div>

          <div className="admin-profile-item">
            <span>Account Status</span>
            <div>
              <span className="staff-status-badge active">
                <span className="status-dot" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="admin-profile-card">
        <div className="admin-profile-card-header">
          <div>
            <h2>
              <UiIcon name="lock" size={20} />
              Change Password
            </h2>
            <p>Update your password regularly to keep your administrator account secure</p>
          </div>
        </div>

        <div className="admin-password-security-note">
          <UiIcon name="shield" size={16} />
          <span>
            <strong>Security Notice:</strong> When you change your password, all other active refresh sessions for your administrator account will be automatically revoked.
          </span>
        </div>

        <form className="admin-password-form" onSubmit={handlePasswordSubmit} noValidate>
          {/* Current Password */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-current-password">
              Current Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="admin-current-password"
                type={showCurrentPassword ? "text" : "password"}
                className={`admin-form-input ${formErrors.currentPassword ? "has-error" : ""}`}
                placeholder="Enter your current password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  if (formErrors.currentPassword) {
                    setFormErrors({ ...formErrors, currentPassword: "" });
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                <UiIcon name="eye" size={16} />
              </button>
            </div>
            {formErrors.currentPassword && (
              <span className="admin-field-error">{formErrors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-new-password">
              New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="admin-new-password"
                type={showNewPassword ? "text" : "password"}
                className={`admin-form-input ${formErrors.newPassword ? "has-error" : ""}`}
                placeholder="Enter new password (min. 8 characters with 1 letter & 1 number)"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  if (formErrors.newPassword) {
                    setFormErrors({ ...formErrors, newPassword: "" });
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                <UiIcon name="eye" size={16} />
              </button>
            </div>
            {formErrors.newPassword ? (
              <span className="admin-field-error">{formErrors.newPassword}</span>
            ) : (
              <span className="admin-field-hint">Must be at least 8 characters with 1 letter & 1 number</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="admin-confirm-password">
              Confirm New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="admin-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className={`admin-form-input ${formErrors.confirmPassword ? "has-error" : ""}`}
                placeholder="Re-enter your new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  if (formErrors.confirmPassword) {
                    setFormErrors({ ...formErrors, confirmPassword: "" });
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <UiIcon name="eye" size={16} />
              </button>
            </div>
            {formErrors.confirmPassword && (
              <span className="admin-field-error">{formErrors.confirmPassword}</span>
            )}
          </div>

          <div className="admin-password-form-actions">
            <button
              type="submit"
              className="hp-btn hp-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
            <button
              type="button"
              className="hp-btn hp-btn-secondary"
              onClick={() => {
                setPasswordForm(INITIAL_PASSWORD_FORM);
                setFormErrors({});
                setServerError("");
              }}
              disabled={isSubmitting}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProfile;
