import { useCallback, useContext, useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { AuthContext } from "../context/authContextDefinition";
import {
  getAdminStaff,
  getAdminStaffById,
  createAdminStaff,
  updateAdminStaff,
  deactivateAdminStaff,
  activateAdminStaff,
} from "../services/adminStaffService";
import "../styles/AdminStaff.css";

const ROLE_OPTIONS = [
  { value: "WARDEN", label: "Warden" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const INITIAL_CREATE_FORM = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  role: "WARDEN",
};

function formatRoleLabel(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "WARDEN":
      return "Warden";
    case "PRINCIPAL":
      return "Principal";
    default:
      return role || "Staff";
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "staff-role-super-admin";
    case "WARDEN":
      return "staff-role-warden";
    case "PRINCIPAL":
      return "staff-role-principal";
    default:
      return "";
  }
}

function AdminStaff() {
  const { principal } = useContext(AuthContext);

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // View Modal
  const [viewingStaff, setViewingStaff] = useState(null);
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
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_CREATE_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editServerError, setEditServerError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  // Activate / Deactivate Confirmation Dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetStaff, setTargetStaff] = useState(null);
  const [confirmAction, setConfirmAction] = useState("deactivate"); // "deactivate" | "activate"
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // ==================== LOAD STAFF ====================

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminStaff(
        currentPage,
        pageSize,
        search,
        roleFilter
      );
      const data = response.data;

      setStaffList(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to load staff list:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load staff directory. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, roleFilter]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStaff();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadStaff]);

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

    if (!form.role) {
      errors.role = "Role is required";
    } else if (!["WARDEN", "PRINCIPAL", "SUPER_ADMIN"].includes(form.role)) {
      errors.role = "Invalid role selected";
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

    // Password is optional for edit; if provided, enforce criteria
    if (form.password && form.password.trim().length > 0) {
      if (form.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.password)) {
        errors.password = "Password must contain at least one letter and one number";
      }
    }

    if (!form.role) {
      errors.role = "Role is required";
    } else if (!["WARDEN", "PRINCIPAL", "SUPER_ADMIN"].includes(form.role)) {
      errors.role = "Invalid role selected";
    }

    return errors;
  };

  // ==================== VIEW STAFF ====================

  const handleOpenViewModal = (staff) => {
    setViewingStaff(staff);
    setShowViewModal(true);
  };

  // ==================== CREATE STAFF ====================

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
      await createAdminStaff({
        username: createForm.username.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });

      setShowCreateModal(false);
      setSuccessMessage(`Staff member "${createForm.fullName.trim()}" created successfully.`);
      await loadStaff();
    } catch (err) {
      console.error("Create staff error:", err);
      setCreateServerError(
        err.response?.data?.message || "Failed to create staff account. Please try again."
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // ==================== EDIT STAFF ====================

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setEditForm({
      username: staff.username || "",
      fullName: staff.fullName || "",
      email: staff.email || "",
      password: "", // blank indicates keep existing password
      role: staff.role || "WARDEN",
    });
    setEditErrors({});
    setEditServerError("");
    setShowPasswordEdit(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    setEditServerError("");

    const errors = validateEdit(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const payload = {
        username: editForm.username.trim(),
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };

      // Only include password if a new password was entered
      if (editForm.password && editForm.password.trim().length > 0) {
        payload.password = editForm.password;
      }

      await updateAdminStaff(editingStaff.id, payload);

      setShowEditModal(false);
      setSuccessMessage(`Staff member "${editForm.fullName.trim()}" updated successfully.`);
      await loadStaff();
    } catch (err) {
      console.error("Edit staff error:", err);
      setEditServerError(
        err.response?.data?.message || "Failed to update staff account. Please try again."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ==================== ACTIVATE / DEACTIVATE ====================

  const handlePromptToggleStatus = (staff, action) => {
    setTargetStaff(staff);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetStaff) return;

    try {
      setIsSubmittingConfirm(true);
      if (confirmAction === "deactivate") {
        await deactivateAdminStaff(targetStaff.id);
        setSuccessMessage(`Staff member "${targetStaff.fullName}" has been deactivated.`);
      } else {
        await activateAdminStaff(targetStaff.id);
        setSuccessMessage(`Staff member "${targetStaff.fullName}" has been activated.`);
      }

      setShowConfirmModal(false);
      setTargetStaff(null);
      await loadStaff();
    } catch (err) {
      console.error("Status toggle error:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${confirmAction} staff member. Please try again.`
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  // ==================== FILTERING & PAGINATION ====================

  const displayedStaff = staffList.filter((s) => {
    if (statusFilter === "ACTIVE") return s.active === true;
    if (statusFilter === "INACTIVE") return s.active === false;
    return true;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCurrentUser = (staff) => {
    if (!principal || !staff) return false;
    return principal.id === staff.id || principal.username === staff.username;
  };

  return (
    <div className="admin-staff-page">
      {/* ================= HEADER ================= */}
      <header className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMINISTRATION</p>
          <h1 className="admin-page-title">Staff Management</h1>
          <p className="admin-page-subtitle">
            Manage administrative staff accounts, assign roles (Warden, Principal, Super Admin), update profile details, and manage system access.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-stat-chip">
            <strong>{totalElements}</strong>
            <small>Total Staff</small>
          </div>
          <button
            type="button"
            className="btn-add-staff"
            onClick={handleOpenCreateModal}
          >
            <UiIcon name="plus" size={18} />
            <span>Add Staff</span>
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
          {/* Role Filters */}
          <button
            type="button"
            className={`admin-filter-pill ${roleFilter === "ALL" ? "active" : ""}`}
            onClick={() => {
              setRoleFilter("ALL");
              setCurrentPage(0);
            }}
          >
            All Roles
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${roleFilter === "WARDEN" ? "active" : ""}`}
            onClick={() => {
              setRoleFilter("WARDEN");
              setCurrentPage(0);
            }}
          >
            Wardens
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${roleFilter === "PRINCIPAL" ? "active" : ""}`}
            onClick={() => {
              setRoleFilter("PRINCIPAL");
              setCurrentPage(0);
            }}
          >
            Principals
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${roleFilter === "SUPER_ADMIN" ? "active" : ""}`}
            onClick={() => {
              setRoleFilter("SUPER_ADMIN");
              setCurrentPage(0);
            }}
          >
            Super Admins
          </button>

          <div className="admin-filter-divider" />

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
            onClick={loadStaff}
            title="Reload staff directory"
          >
            <UiIcon name="refresh" size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= RESULTS INFO ================= */}
      {!loading && totalElements > 0 && (
        <div className="admin-results-info">
          Showing <strong>{currentPage * pageSize + 1}–{Math.min(currentPage * pageSize + displayedStaff.length, totalElements)}</strong> of <strong>{totalElements}</strong> staff members
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {loading && (
        <div className="admin-table-card">
          <div className="admin-loading-container">
            <div className="admin-loading-spinner" />
            <p>Loading staff directory...</p>
          </div>
        </div>
      )}

      {!loading && displayedStaff.length === 0 && (
        <div className="admin-table-card">
          <div className="admin-empty-container">
            <div className="admin-empty-icon">🛡️</div>
            <h3>No Staff Members Found</h3>
            <p>
              {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                ? "No staff member matches your search query or filter criteria."
                : "No staff members are currently registered in the system."}
            </p>
            {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                className="hp-btn hp-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
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

      {!loading && displayedStaff.length > 0 && (
        <div className="admin-table-card">
          <div className="admin-table-container">
            <table className="admin-staff-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStaff.map((s) => {
                  const isCurrent = isCurrentUser(s);
                  return (
                    <tr key={s.id}>
                      {/* Identity */}
                      <td>
                        <div className="staff-identity">
                          <div className="staff-avatar">
                            {s.fullName ? s.fullName.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div className="staff-identity-text">
                            <div className="staff-name-wrap">
                              <span className="staff-name">{s.fullName}</span>
                              {isCurrent && <span className="you-pill">You</span>}
                            </div>
                            <span className="staff-username">@{s.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="staff-email">{s.email}</span>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`staff-role-badge ${getRoleBadgeClass(s.role)}`}>
                          {formatRoleLabel(s.role)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`staff-status-badge ${s.active ? "active" : "inactive"}`}
                        >
                          <span className="status-dot" />
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-table-view"
                            onClick={() => handleOpenViewModal(s)}
                            title="View staff details"
                          >
                            <UiIcon name="eye" size={14} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            className="btn-table-edit"
                            onClick={() => handleOpenEditModal(s)}
                            title="Edit staff profile"
                          >
                            <UiIcon name="edit" size={14} />
                            <span>Edit</span>
                          </button>

                          {s.active ? (
                            <button
                              type="button"
                              className="btn-table-deactivate"
                              onClick={() => handlePromptToggleStatus(s, "deactivate")}
                              title="Deactivate staff account"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-table-activate"
                              onClick={() => handlePromptToggleStatus(s, "activate")}
                              title="Activate staff account"
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

      {/* ================= VIEW STAFF MODAL ================= */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Staff Account Details"
        subtitle={viewingStaff ? `@${viewingStaff.username}` : ""}
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
        {viewingStaff && (
          <div className="staff-view-card">
            <div className="staff-view-header">
              <div className="staff-view-avatar">
                {viewingStaff.fullName ? viewingStaff.fullName.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="staff-view-title">
                <h3 className="staff-view-name">{viewingStaff.fullName}</h3>
                <div className="staff-view-badges">
                  <span className={`staff-role-badge ${getRoleBadgeClass(viewingStaff.role)}`}>
                    {formatRoleLabel(viewingStaff.role)}
                  </span>
                  <span
                    className={`staff-status-badge ${viewingStaff.active ? "active" : "inactive"}`}
                  >
                    <span className="status-dot" />
                    {viewingStaff.active ? "Active" : "Inactive"}
                  </span>
                  {isCurrentUser(viewingStaff) && <span className="you-pill">You</span>}
                </div>
              </div>
            </div>

            {isCurrentUser(viewingStaff) && (
              <div className="staff-view-self-note">
                <UiIcon name="shield" size={16} />
                <span>You are currently signed in with this administrative account.</span>
              </div>
            )}

            <div className="staff-view-grid">
              <div className="staff-view-item">
                <span className="staff-view-label">Username</span>
                <span className="staff-view-val mono">@{viewingStaff.username}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Full Name</span>
                <span className="staff-view-val">{viewingStaff.fullName}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Email Address</span>
                <span className="staff-view-val">{viewingStaff.email}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Administrative Role</span>
                <span className="staff-view-val">{formatRoleLabel(viewingStaff.role)}</span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Account Status</span>
                <span className="staff-view-val">
                  {viewingStaff.active ? "Active (Access Enabled)" : "Inactive (Access Suspended)"}
                </span>
              </div>

              <div className="staff-view-item">
                <span className="staff-view-label">Staff Record ID</span>
                <span className="staff-view-val mono">#{viewingStaff.id}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CREATE STAFF MODAL ================= */}
      <Modal
        open={showCreateModal}
        onClose={() => !isSubmittingCreate && setShowCreateModal(false)}
        title="Add Staff Member"
        subtitle="Provide credentials and assign an administrative role"
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
              form="create-staff-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingCreate}
            >
              {isSubmittingCreate ? "Creating..." : "Create Staff"}
            </button>
          </>
        }
      >
        <form id="create-staff-form" onSubmit={handleCreateSubmit} noValidate>
          {createServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {createServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Username */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-staff-username">
                Username <span className="required-star">*</span>
              </label>
              <input
                id="create-staff-username"
                type="text"
                className={`admin-form-input ${createErrors.username ? "has-error" : ""}`}
                placeholder="e.g. warden_north"
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
              <label className="admin-form-label" htmlFor="create-staff-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="create-staff-fullName"
                type="text"
                className={`admin-form-input ${createErrors.fullName ? "has-error" : ""}`}
                placeholder="e.g. Kavitha Raman"
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
              <label className="admin-form-label" htmlFor="create-staff-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="create-staff-email"
                type="email"
                className={`admin-form-input ${createErrors.email ? "has-error" : ""}`}
                placeholder="e.g. kavitha@hostelpass.com"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
              {createErrors.email && (
                <span className="admin-field-error">{createErrors.email}</span>
              )}
            </div>

            {/* Role */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-staff-role">
                Administrative Role <span className="required-star">*</span>
              </label>
              <select
                id="create-staff-role"
                className={`admin-form-select ${createErrors.role ? "has-error" : ""}`}
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {createErrors.role && (
                <span className="admin-field-error">{createErrors.role}</span>
              )}
            </div>

            {/* Password */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="create-staff-password">
                Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="create-staff-password"
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

      {/* ================= EDIT STAFF MODAL ================= */}
      <Modal
        open={showEditModal}
        onClose={() => !isSubmittingEdit && setShowEditModal(false)}
        title="Edit Staff Profile"
        subtitle={editingStaff ? `Updating ${editingStaff.fullName} (@${editingStaff.username})` : ""}
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
              form="edit-staff-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingEdit}
            >
              {isSubmittingEdit ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-staff-form" onSubmit={handleEditSubmit} noValidate>
          {editServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {editServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Username */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-staff-username">
                Username <span className="required-star">*</span>
              </label>
              <input
                id="edit-staff-username"
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
              <label className="admin-form-label" htmlFor="edit-staff-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-staff-fullName"
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
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-staff-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="edit-staff-email"
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

            {/* Role */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-staff-role">
                Administrative Role <span className="required-star">*</span>
              </label>
              <select
                id="edit-staff-role"
                className={`admin-form-select ${editErrors.role ? "has-error" : ""}`}
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {editErrors.role && (
                <span className="admin-field-error">{editErrors.role}</span>
              )}
            </div>

            {/* Reset Password (Optional) */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="edit-staff-password">
                Reset Password <span style={{ fontWeight: "normal", color: "var(--color-text-muted)" }}>(optional)</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="edit-staff-password"
                  type={showPasswordEdit ? "text" : "password"}
                  className={`admin-form-input ${editErrors.password ? "has-error" : ""}`}
                  placeholder="Leave blank to keep existing password unchanged"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                  title={showPasswordEdit ? "Hide password" : "Show password"}
                >
                  <UiIcon name="eye" size={16} />
                </button>
              </div>
              {editErrors.password ? (
                <span className="admin-field-error">{editErrors.password}</span>
              ) : (
                <span className="admin-field-hint">Leave blank to keep current password</span>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= CONFIRMATION DIALOG ================= */}
      <Modal
        open={showConfirmModal}
        onClose={() => !isSubmittingConfirm && setShowConfirmModal(false)}
        title={confirmAction === "deactivate" ? "Deactivate Staff Account" : "Activate Staff Account"}
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
              disabled={isSubmittingConfirm}
            >
              {isSubmittingConfirm
                ? "Processing..."
                : confirmAction === "deactivate"
                ? "Yes, Deactivate Staff"
                : "Yes, Activate Staff"}
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
              ? "Are you sure you want to deactivate this staff account? Deactivated staff cannot log into the system or process outpass requests. Past decision history and audit logs will remain intact."
              : "Are you sure you want to reactivate this staff account? The staff member will immediately regain access to log in and perform administrative duties."}
          </p>

          {targetStaff && (
            <div className="confirm-target-box">
              <strong>{targetStaff.fullName}</strong>
              <small>@{targetStaff.username} • {formatRoleLabel(targetStaff.role)}</small>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AdminStaff;
