import { useCallback, useContext, useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { AuthContext } from "../context/authContextDefinition";
import {
  getAdminAdmins,
  createAdminAdmin,
  updateAdminAdmin,
  deactivateAdminAdmin,
  activateAdminAdmin,
} from "../services/adminAdminService";
import "../styles/AdminStaff.css";

const INITIAL_CREATE_FORM = {
  username: "",
  fullName: "",
  email: "",
  password: "",
};

const INITIAL_EDIT_FORM = {
  username: "",
  fullName: "",
  email: "",
};

function AdminAdmins() {
  const { principal } = useContext(AuthContext);

  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // View Modal
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [createServerError, setCreateServerError] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [showPasswordCreate, setShowPasswordCreate] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editServerError, setEditServerError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Activate / Deactivate Confirmation Dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState(null);
  const [confirmAction, setConfirmAction] = useState("deactivate"); // "deactivate" | "activate"
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // ==================== LOAD ADMINS ====================

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAdmins(currentPage, pageSize, search);
      const data = response.data;

      setAdminList(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to load admins list:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load administrators directory. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAdmins();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadAdmins]);

  // ==================== VALIDATION HELPERS ====================

  const validateCreate = (form) => {
    const errors = {};
    const trimmedUsername = form.username.trim();
    if (!trimmedUsername) {
      errors.username = "Username is required";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      errors.username = "Username must be between 3 and 50 characters";
    } else if (!/^[A-Za-z0-9_]+$/.test(trimmedUsername)) {
      errors.username = "Username must contain only letters, numbers, and underscores";
    }

    const trimmedFullName = form.fullName.trim();
    if (!trimmedFullName) {
      errors.fullName = "Full name is required";
    } else if (trimmedFullName.length > 100) {
      errors.fullName = "Full name must not exceed 100 characters";
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (trimmedEmail.length > 120) {
      errors.email = "Email must not exceed 120 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.password)) {
      errors.password = "Password must contain at least one letter and one number";
    }

    return errors;
  };

  const validateEdit = (form) => {
    const errors = {};
    const trimmedUsername = form.username.trim();
    if (!trimmedUsername) {
      errors.username = "Username is required";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      errors.username = "Username must be between 3 and 50 characters";
    } else if (!/^[A-Za-z0-9_]+$/.test(trimmedUsername)) {
      errors.username = "Username must contain only letters, numbers, and underscores";
    }

    const trimmedFullName = form.fullName.trim();
    if (!trimmedFullName) {
      errors.fullName = "Full name is required";
    } else if (trimmedFullName.length > 100) {
      errors.fullName = "Full name must not exceed 100 characters";
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (trimmedEmail.length > 120) {
      errors.email = "Email must not exceed 120 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    return errors;
  };

  // ==================== VIEW ADMIN ====================

  const handleOpenViewModal = (admin) => {
    setViewingAdmin(admin);
    setShowViewModal(true);
  };

  // ==================== CREATE ADMIN ====================

  const handleOpenCreateModal = () => {
    setCreateForm(INITIAL_CREATE_FORM);
    setCreateErrors({});
    setCreateServerError("");
    setShowPasswordCreate(false);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateServerError("");

    const errors = validateCreate(createForm);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await createAdminAdmin({
        username: createForm.username.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      });

      setShowCreateModal(false);
      setSuccessMessage(`Administrator "${createForm.fullName.trim()}" created successfully.`);
      await loadAdmins();
    } catch (err) {
      console.error("Create admin error:", err);
      setCreateServerError(
        err.response?.data?.message || "Failed to create administrator account. Please try again."
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // ==================== EDIT ADMIN ====================

  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      username: admin.username || "",
      fullName: admin.fullName || "",
      email: admin.email || "",
    });
    setEditErrors({});
    setEditServerError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditServerError("");

    const errors = validateEdit(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await updateAdminAdmin(editingAdmin.id, {
        username: editForm.username.trim(),
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      });

      setShowEditModal(false);
      setSuccessMessage(`Administrator "${editForm.fullName.trim()}" updated successfully.`);
      await loadAdmins();
    } catch (err) {
      console.error("Edit admin error:", err);
      setEditServerError(
        err.response?.data?.message || "Failed to update administrator account. Please try again."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ==================== ACTIVATE / DEACTIVATE ====================

  const handlePromptToggleStatus = (admin, action) => {
    setTargetAdmin(admin);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetAdmin) return;

    try {
      setIsSubmittingConfirm(true);
      if (confirmAction === "deactivate") {
        await deactivateAdminAdmin(targetAdmin.id);
        setSuccessMessage(`Administrator "${targetAdmin.fullName}" has been deactivated.`);
      } else {
        await activateAdminAdmin(targetAdmin.id);
        setSuccessMessage(`Administrator "${targetAdmin.fullName}" has been activated.`);
      }

      setShowConfirmModal(false);
      setTargetAdmin(null);
      await loadAdmins();
    } catch (err) {
      console.error("Status toggle error:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${confirmAction} administrator. Please try again.`
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  // ==================== FILTERING & PAGINATION ====================

  const displayedAdmins = adminList.filter((a) => {
    if (statusFilter === "ACTIVE") return a.active === true;
    if (statusFilter === "INACTIVE") return a.active === false;
    return true;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCurrentUser = (admin) => {
    if (!principal || !admin) return false;
    return principal.id === admin.id || principal.username === admin.username;
  };

  return (
    <div className="admin-staff-page">
      {/* ================= HEADER ================= */}
      <header className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMINISTRATION</p>
          <h1 className="admin-page-title">Admin Management</h1>
          <p className="admin-page-subtitle">
            Manage Super Admin accounts with system-wide privileges, configure security profiles, and manage administrative access.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-stat-chip">
            <strong>{totalElements}</strong>
            <small>Total Admins</small>
          </div>
          <button
            type="button"
            className="btn-add-staff"
            onClick={handleOpenCreateModal}
          >
            <UiIcon name="plus" size={18} />
            <span>Add Admin</span>
          </button>
        </div>
      </header>

      {/* ================= SUCCESS BANNER ================= */}
      {successMessage && (
        <div className="admin-banner admin-banner-success" role="status">
          <div className="admin-banner-content">
            <UiIcon name="check" size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            className="admin-banner-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* ================= ERROR BANNER ================= */}
      {error && (
        <div className="admin-banner admin-banner-error" role="alert">
          <div className="admin-banner-content">
            <UiIcon name="x" size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="admin-banner-close"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ================= TOOLBAR ================= */}
      <div className="admin-toolbar">
        {/* Search */}
        <div className="admin-search-wrapper">
          <span className="admin-search-icon">
            <UiIcon name="search" size={18} />
          </span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => {
                setSearch("");
                setCurrentPage(0);
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="admin-filter-group">
          {/* Status Filters */}
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All Status
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === "ACTIVE" ? "active" : ""}`}
            onClick={() => setStatusFilter("ACTIVE")}
          >
            Active
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === "INACTIVE" ? "active" : ""}`}
            onClick={() => setStatusFilter("INACTIVE")}
          >
            Inactive
          </button>

          <button
            type="button"
            className="admin-btn-refresh"
            onClick={loadAdmins}
            title="Reload administrator directory"
          >
            <UiIcon name="refresh" size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= RESULTS INFO ================= */}
      {!loading && totalElements > 0 && (
        <div className="admin-results-info">
          Showing <strong>{currentPage * pageSize + 1}–{Math.min(currentPage * pageSize + displayedAdmins.length, totalElements)}</strong> of <strong>{totalElements}</strong> administrators
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {loading && (
        <div className="admin-table-card">
          <div className="admin-loading-container">
            <div className="admin-loading-spinner" />
            <p>Loading administrator directory...</p>
          </div>
        </div>
      )}

      {!loading && displayedAdmins.length === 0 && (
        <div className="admin-table-card">
          <div className="admin-empty-container">
            <div className="admin-empty-icon">🛡️</div>
            <h3>No Administrators Found</h3>
            <p>
              {search || statusFilter !== "ALL"
                ? "No administrator matches your search query or filter criteria."
                : "No administrator accounts found."}
            </p>
            {(search || statusFilter !== "ALL") && (
              <button
                type="button"
                className="hp-btn hp-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCurrentPage(0);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && displayedAdmins.length > 0 && (
        <div className="admin-table-card">
          <div className="admin-table-container">
            <table className="admin-staff-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAdmins.map((a) => {
                  const isCurrent = isCurrentUser(a);
                  return (
                    <tr key={a.id}>
                      {/* Identity */}
                      <td>
                        <div className="staff-identity">
                          <div className="staff-avatar">
                            {a.fullName ? a.fullName.charAt(0).toUpperCase() : "A"}
                          </div>
                          <div className="staff-identity-text">
                            <div className="staff-name-wrap">
                              <span className="staff-name">{a.fullName}</span>
                              {isCurrent && <span className="you-pill">You</span>}
                            </div>
                            <span className="staff-username">@{a.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="staff-email">{a.email}</span>
                      </td>

                      {/* Role */}
                      <td>
                        <span className="staff-role-badge staff-role-super-admin">
                          Super Admin
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`staff-status-badge ${a.active ? "active" : "inactive"}`}
                        >
                          <span className="status-dot" />
                          {a.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-table-view"
                            onClick={() => handleOpenViewModal(a)}
                            title="View administrator details"
                          >
                            <UiIcon name="eye" size={14} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn-table-edit"
                            onClick={() => handleOpenEditModal(a)}
                            title="Edit administrator profile"
                          >
                            <UiIcon name="edit" size={14} />
                            <span>Edit</span>
                          </button>

                          {a.active ? (
                            <button
                              type="button"
                              className="btn-table-deactivate"
                              onClick={() => handlePromptToggleStatus(a, "deactivate")}
                              title={isCurrent ? "You cannot deactivate your own account" : "Deactivate admin account"}
                              disabled={isCurrent}
                              style={isCurrent ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-table-activate"
                              onClick={() => handlePromptToggleStatus(a, "activate")}
                              title="Activate admin account"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* ================= VIEW ADMIN MODAL ================= */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Admin Account Details"
        subtitle={viewingAdmin ? `@${viewingAdmin.username}` : ""}
        footer={
          <button
            type="button"
            className="hp-btn hp-btn-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
        }
      >
        {viewingAdmin && (
          <div className="staff-view-card">
            <div className="staff-view-header">
              <div className="staff-view-avatar">
                {viewingAdmin.fullName ? viewingAdmin.fullName.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="staff-view-title">
                <h3 className="staff-view-name">{viewingAdmin.fullName}</h3>
                <div className="staff-view-badges">
                  <span className="staff-role-badge staff-role-super-admin">
                    Super Admin
                  </span>
                  <span
                    className={`staff-status-badge ${viewingAdmin.active ? "active" : "inactive"}`}
                  >
                    <span className="status-dot" />
                    {viewingAdmin.active ? "Active" : "Inactive"}
                  </span>
                  {isCurrentUser(viewingAdmin) && <span className="you-pill">You</span>}
                </div>
              </div>
            </div>

            {isCurrentUser(viewingAdmin) && (
              <div className="staff-view-self-note">
                <UiIcon name="shield" size={16} />
                <span>You are currently signed in with this administrative account.</span>
              </div>
            )}

            <div className="staff-view-grid">
              <div className="staff-view-item">
                <span className="staff-view-label">Username</span>
                <span className="staff-view-val mono">@{viewingAdmin.username}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Full Name</span>
                <span className="staff-view-val">{viewingAdmin.fullName}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Email Address</span>
                <span className="staff-view-val">{viewingAdmin.email}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Administrative Role</span>
                <span className="staff-view-val">Super Admin (System Administrator)</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Account Status</span>
                <span className="staff-view-val">
                  {viewingAdmin.active ? "Active (Full Access)" : "Inactive (Access Suspended)"}
                </span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Admin Record ID</span>
                <span className="staff-view-val mono">#{viewingAdmin.id}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CREATE ADMIN MODAL ================= */}
      <Modal
        open={showCreateModal}
        onClose={() => !isSubmittingCreate && setShowCreateModal(false)}
        title="Add Administrator"
        subtitle="Create a new Super Admin account with platform-wide privileges"
        footer={
          <>
            <button
              type="button"
              className="hp-btn hp-btn-secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={isSubmittingCreate}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-admin-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingCreate}
            >
              {isSubmittingCreate ? "Creating..." : "Create Admin"}
            </button>
          </>
        }
      >
        <form id="create-admin-form" onSubmit={handleCreateSubmit} noValidate>
          {createServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {createServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Username */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-admin-username">
                Username <span className="required-star">*</span>
              </label>
              <input
                id="create-admin-username"
                type="text"
                className={`admin-form-input ${createErrors.username ? "has-error" : ""}`}
                placeholder="e.g. sysadmin2"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
              />
              {createErrors.username ? (
                <span className="admin-field-error">{createErrors.username}</span>
              ) : (
                <span className="admin-field-hint">3–50 chars (letters, numbers, underscores)</span>
              )}
            </div>

            {/* Full Name */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-admin-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="create-admin-fullName"
                type="text"
                className={`admin-form-input ${createErrors.fullName ? "has-error" : ""}`}
                placeholder="e.g. Ramesh Chandra"
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, fullName: e.target.value })
                }
              />
              {createErrors.fullName && (
                <span className="admin-field-error">{createErrors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-admin-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="create-admin-email"
                type="email"
                className={`admin-form-input ${createErrors.email ? "has-error" : ""}`}
                placeholder="e.g. ramesh@hostelpass.edu"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
              {createErrors.email && (
                <span className="admin-field-error">{createErrors.email}</span>
              )}
            </div>

            {/* Role (Read-only / informational) */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                Assigned Role
              </label>
              <div style={{ display: "flex", alignItems: "center", height: "42px" }}>
                <span className="staff-role-badge staff-role-super-admin" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  Super Admin
                </span>
              </div>
              <span className="admin-field-hint">Fixed to Super Admin role</span>
            </div>

            {/* Password */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="create-admin-password">
                Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="create-admin-password"
                  type={showPasswordCreate ? "text" : "password"}
                  className={`admin-form-input ${createErrors.password ? "has-error" : ""}`}
                  placeholder="Min 8 characters with at least 1 letter and 1 number"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordCreate(!showPasswordCreate)}
                  title={showPasswordCreate ? "Hide password" : "Show password"}
                >
                  <UiIcon name="eye" size={16} />
                </button>
              </div>
              {createErrors.password ? (
                <span className="admin-field-error">{createErrors.password}</span>
              ) : (
                <span className="admin-field-hint">At least 8 characters with 1 letter & 1 number</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= EDIT ADMIN MODAL ================= */}
      <Modal
        open={showEditModal}
        onClose={() => !isSubmittingEdit && setShowEditModal(false)}
        title="Edit Administrator Profile"
        subtitle={editingAdmin ? `Updating ${editingAdmin.fullName} (@${editingAdmin.username})` : ""}
        footer={
          <>
            <button
              type="button"
              className="hp-btn hp-btn-secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-admin-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingEdit}
            >
              {isSubmittingEdit ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-admin-form" onSubmit={handleEditSubmit} noValidate>
          {editServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {editServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Username */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-admin-username">
                Username <span className="required-star">*</span>
              </label>
              <input
                id="edit-admin-username"
                type="text"
                className={`admin-form-input ${editErrors.username ? "has-error" : ""}`}
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
              {editErrors.username && (
                <span className="admin-field-error">{editErrors.username}</span>
              )}
            </div>

            {/* Full Name */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-admin-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-admin-fullName"
                type="text"
                className={`admin-form-input ${editErrors.fullName ? "has-error" : ""}`}
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
              />
              {editErrors.fullName && (
                <span className="admin-field-error">{editErrors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="edit-admin-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="edit-admin-email"
                type="email"
                className={`admin-form-input ${editErrors.email ? "has-error" : ""}`}
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
              {editErrors.email && (
                <span className="admin-field-error">{editErrors.email}</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= CONFIRMATION DIALOG ================= */}
      <Modal
        open={showConfirmModal}
        onClose={() => !isSubmittingConfirm && setShowConfirmModal(false)}
        title={confirmAction === "deactivate" ? "Deactivate Admin Account" : "Activate Admin Account"}
        footer={
          <>
            <button
              type="button"
              className="hp-btn hp-btn-secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmittingConfirm}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`hp-btn ${confirmAction === "deactivate" ? "hp-btn-danger" : "hp-btn-primary"}`}
              onClick={handleConfirmToggleStatus}
              disabled={isSubmittingConfirm || (confirmAction === "deactivate" && targetAdmin && isCurrentUser(targetAdmin))}
            >
              {isSubmittingConfirm
                ? "Processing..."
                : confirmAction === "deactivate"
                ? "Yes, Deactivate Admin"
                : "Yes, Activate Admin"}
            </button>
          </>
        }
      >
        <div className="confirm-dialog-content">
          <div className={`confirm-icon-circle ${confirmAction}`}>
            {confirmAction === "deactivate" ? "⚠️" : "✓"}
          </div>

          <p className="confirm-description">
            {confirmAction === "deactivate"
              ? "Are you sure you want to deactivate this Super Admin account? Deactivated administrators cannot log in or manage students, staff, or system settings."
              : "Are you sure you want to reactivate this Super Admin account? The administrator will immediately regain access to the Admin Portal."}
          </p>

          {targetAdmin && isCurrentUser(targetAdmin) && confirmAction === "deactivate" && (
            <div className="form-server-error" style={{ marginBottom: "var(--space-4)" }}>
              ⚠️ You cannot deactivate your own administrative account.
            </div>
          )}

          {targetAdmin && (
            <div className="confirm-target-box">
              <strong>{targetAdmin.fullName}</strong>
              <small>@{targetAdmin.username} • Super Admin</small>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AdminAdmins;
