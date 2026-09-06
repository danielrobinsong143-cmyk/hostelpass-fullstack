import { useCallback, useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import {
  getAdminStudents,
  getAdminStudentById,
  createAdminStudent,
  updateAdminStudent,
  deactivateAdminStudent,
  activateAdminStudent,
  resetStudentPassword,
} from "../services/adminStudentService";
import "../styles/AdminStudents.css";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"];

const INITIAL_CREATE_FORM = {
  rollNumber: "",
  fullName: "",
  email: "",
  password: "",
  roomNumber: "",
  branch: "",
  department: "",
  yearOfStudy: "1st Year",
  mobileNumber: "",
};

const INITIAL_EDIT_FORM = {
  rollNumber: "",
  fullName: "",
  email: "",
  roomNumber: "",
  branch: "",
  department: "",
  yearOfStudy: "1st Year",
  mobileNumber: "",
};

const INITIAL_RESET_PASSWORD = {
  newPassword: "",
  confirmPassword: "",
};

function AdminStudents() {
  const [students, setStudents] = useState([]);
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [viewError, setViewError] = useState("");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(INITIAL_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [createServerError, setCreateServerError] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [showPasswordCreate, setShowPasswordCreate] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editServerError, setEditServerError] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Reset Password Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resettingStudent, setResettingStudent] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState(INITIAL_RESET_PASSWORD);
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});
  const [resetPasswordServerError, setResetPasswordServerError] = useState("");
  const [isSubmittingResetPassword, setIsSubmittingResetPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Activate / Deactivate Confirmation Dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState("deactivate"); // "deactivate" | "activate"
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // ==================== LOAD STUDENTS ====================

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminStudents(currentPage, pageSize, search);
      const data = response.data;

      setStudents(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error("Failed to load students:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load students. Please check your network and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadStudents]);

  // ==================== VALIDATION HELPERS ====================

  const validateCreate = (form) => {
    const errors = {};
    if (!form.rollNumber.trim()) {
      errors.rollNumber = "Roll number is required";
    } else if (!/^[A-Za-z0-9]{4,20}$/.test(form.rollNumber.trim())) {
      errors.rollNumber = "Roll number must be 4-20 alphanumeric characters";
    }

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (form.fullName.trim().length > 100) {
      errors.fullName = "Full name must not exceed 100 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.password)) {
      errors.password = "Password must contain at least one letter and one number";
    }

    if (!form.roomNumber.trim()) {
      errors.roomNumber = "Room number is required";
    }

    if (!form.branch.trim()) {
      errors.branch = "Branch is required";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required";
    }

    if (!form.yearOfStudy.trim()) {
      errors.yearOfStudy = "Year of study is required";
    }

    if (!form.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      errors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    return errors;
  };

  const validateEdit = (form) => {
    const errors = {};
    if (!form.rollNumber.trim()) {
      errors.rollNumber = "Roll number is required";
    } else if (!/^[A-Za-z0-9]{4,20}$/.test(form.rollNumber.trim())) {
      errors.rollNumber = "Roll number must be 4-20 alphanumeric characters";
    }

    if (!form.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (form.fullName.trim().length > 100) {
      errors.fullName = "Full name must not exceed 100 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.roomNumber.trim()) {
      errors.roomNumber = "Room number is required";
    }

    if (!form.branch.trim()) {
      errors.branch = "Branch is required";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required";
    }

    if (!form.yearOfStudy.trim()) {
      errors.yearOfStudy = "Year of study is required";
    }

    if (!form.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      errors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    return errors;
  };

  // ==================== VIEW STUDENT ====================

  const handleOpenViewModal = async (student) => {
    setShowViewModal(true);
    setLoadingView(true);
    setViewError("");
    setViewingStudent(student);

    try {
      const response = await getAdminStudentById(student.id);
      setViewingStudent(response.data);
    } catch (err) {
      console.error("Failed to load student details:", err);
      setViewError(
        err.response?.data?.message ||
          "Could not refresh latest details from server; displaying cached data."
      );
    } finally {
      setLoadingView(false);
    }
  };

  // ==================== CREATE STUDENT ====================

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
      await createAdminStudent({
        rollNumber: createForm.rollNumber.trim(),
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        roomNumber: createForm.roomNumber.trim(),
        branch: createForm.branch.trim(),
        department: createForm.department.trim(),
        yearOfStudy: createForm.yearOfStudy.trim(),
        mobileNumber: createForm.mobileNumber.trim(),
      });

      setShowCreateModal(false);
      setSuccessMessage(`Student "${createForm.fullName.trim()}" created successfully.`);
      await loadStudents();
    } catch (err) {
      console.error("Create student error:", err);
      setCreateServerError(
        err.response?.data?.message || "Failed to create student. Please try again."
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // ==================== EDIT STUDENT ====================

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      rollNumber: student.rollNumber || "",
      fullName: student.fullName || "",
      email: student.email || "",
      roomNumber: student.roomNumber || "",
      branch: student.branch || "",
      department: student.department || "",
      yearOfStudy: student.yearOfStudy || "1st Year",
      mobileNumber: student.mobileNumber || "",
    });
    setEditErrors({});
    setEditServerError("");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditServerError("");

    const errors = validateEdit(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const payload = {
        rollNumber: editForm.rollNumber.trim(),
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        roomNumber: editForm.roomNumber.trim(),
        branch: editForm.branch.trim(),
        department: editForm.department.trim(),
        yearOfStudy: editForm.yearOfStudy.trim(),
        mobileNumber: editForm.mobileNumber.trim(),
      };

      await updateAdminStudent(editingStudent.id, payload);

      setShowEditModal(false);
      setSuccessMessage(`Student "${editForm.fullName.trim()}" updated successfully.`);
      await loadStudents();
    } catch (err) {
      console.error("Edit student error:", err);
      setEditServerError(
        err.response?.data?.message || "Failed to update student. Please try again."
      );
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ==================== RESET STUDENT PASSWORD ====================

  const handleOpenResetPasswordModal = (student) => {
    setResettingStudent(student);
    setResetPasswordForm(INITIAL_RESET_PASSWORD);
    setResetPasswordErrors({});
    setResetPasswordServerError("");
    setShowResetNewPassword(false);
    setShowResetConfirmPassword(false);
    setShowResetPasswordModal(true);
  };

  const validateResetPassword = (form) => {
    const errors = {};
    if (!form.newPassword) {
      errors.newPassword = "New password is required";
    } else if (form.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.newPassword)) {
      errors.newPassword = "Password must contain at least one letter and one number";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Password confirmation is required";
    } else if (form.newPassword && form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resettingStudent) return;
    setResetPasswordServerError("");

    const errors = validateResetPassword(resetPasswordForm);
    if (Object.keys(errors).length > 0) {
      setResetPasswordErrors(errors);
      return;
    }

    try {
      setIsSubmittingResetPassword(true);
      await resetStudentPassword(resettingStudent.id, {
        newPassword: resetPasswordForm.newPassword,
        confirmPassword: resetPasswordForm.confirmPassword,
      });

      setShowResetPasswordModal(false);
      setSuccessMessage(`Password for student "${resettingStudent.fullName}" (${resettingStudent.rollNumber}) was reset successfully. Active sessions revoked.`);
    } catch (err) {
      console.error("Reset student password error:", err);
      setResetPasswordServerError(
        err.response?.data?.message || "Failed to reset student password. Please try again."
      );
    } finally {
      setIsSubmittingResetPassword(false);
    }
  };

  // ==================== ACTIVATE / DEACTIVATE ====================

  const handlePromptToggleStatus = (student, action) => {
    setTargetStudent(student);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!targetStudent) return;

    try {
      setIsSubmittingConfirm(true);
      if (confirmAction === "deactivate") {
        await deactivateAdminStudent(targetStudent.id);
        setSuccessMessage(`Student "${targetStudent.fullName}" has been deactivated.`);
      } else {
        await activateAdminStudent(targetStudent.id);
        setSuccessMessage(`Student "${targetStudent.fullName}" has been activated.`);
      }

      setShowConfirmModal(false);
      setTargetStudent(null);
      await loadStudents();
    } catch (err) {
      console.error("Status toggle error:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${confirmAction} student. Please try again.`
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  // ==================== FILTERING & SEARCH ====================

  const displayedStudents = students.filter((s) => {
    if (statusFilter === "ACTIVE") return s.active === true;
    if (statusFilter === "INACTIVE") return s.active === false;
    return true;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="admin-students-page">
      {/* ================= HEADER ================= */}
      <header className="admin-page-header">
        <div>
          <p className="admin-page-kicker">ADMINISTRATION</p>
          <h1 className="admin-page-title">Student Management</h1>
          <p className="admin-page-subtitle">
            Manage student registrations, academic and room assignments, credential resets, and account access status.
          </p>
        </div>

        <div className="admin-header-actions">
          <div className="admin-stat-chip">
            <strong>{totalElements}</strong>
            <small>Total Students</small>
          </div>
          <button
            type="button"
            className="btn-add-student"
            onClick={handleOpenCreateModal}
          >
            <UiIcon name="plus" size={18} />
            <span>Add Student</span>
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
        <div className="admin-search-wrapper">
          <span className="admin-search-icon">
            <UiIcon name="search" size={18} />
          </span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by roll number, name, email, department, room..."
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

        <div className="admin-filter-group">
          <button
            type="button"
            className={`admin-filter-pill ${statusFilter === "ALL" ? "active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All Students
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
            onClick={loadStudents}
            title="Reload data"
          >
            <UiIcon name="refresh" size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= RESULTS INFO ================= */}
      {!loading && totalElements > 0 && (
        <div className="admin-results-info">
          Showing <strong>{currentPage * pageSize + 1}–{Math.min(currentPage * pageSize + displayedStudents.length, totalElements)}</strong> of <strong>{totalElements}</strong> students
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      {loading && (
        <div className="admin-table-card">
          <div className="admin-loading-container">
            <div className="admin-loading-spinner" />
            <p>Loading student directory...</p>
          </div>
        </div>
      )}

      {!loading && displayedStudents.length === 0 && (
        <div className="admin-table-card">
          <div className="admin-empty-container">
            <div className="admin-empty-icon">👥</div>
            <h3>No Students Found</h3>
            <p>
              {search || statusFilter !== "ALL"
                ? "No student matches your search query or filter criteria."
                : "No students are currently registered in the system."}
            </p>
            {search && (
              <button
                type="button"
                className="hp-btn hp-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCurrentPage(0);
                }}
              >
                Reset Search
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && displayedStudents.length > 0 && (
        <div className="admin-table-card">
          <div className="admin-table-container">
            <table className="admin-students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>Academic</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((s) => (
                  <tr key={s.id}>
                    {/* Student Info */}
                    <td>
                      <div className="student-identity">
                        <div className="student-avatar">
                          {s.fullName ? s.fullName.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div className="student-identity-text">
                          <span className="student-name">{s.fullName}</span>
                          <span className="student-roll">{s.rollNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div className="student-contact">
                        <span className="student-email">{s.email}</span>
                        <span className="student-mobile">📱 {s.mobileNumber || "—"}</span>
                      </div>
                    </td>

                    {/* Academic Info */}
                    <td>
                      <div className="student-academic">
                        <span className="student-dept">{s.department || "—"}</span>
                        <span className="student-sub-academic">
                          {s.branch} • {s.yearOfStudy}
                        </span>
                      </div>
                    </td>

                    {/* Room */}
                    <td>
                      <span className="room-pill">{s.roomNumber || "—"}</span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span
                        className={`student-status-badge ${s.active ? "active" : "inactive"}`}
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
                          title="View student profile"
                        >
                          <UiIcon name="eye" size={14} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          className="btn-table-edit"
                          onClick={() => handleOpenEditModal(s)}
                          title="Edit student profile"
                        >
                          <UiIcon name="edit" size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="btn-table-reset"
                          onClick={() => handleOpenResetPasswordModal(s)}
                          title="Reset student password"
                        >
                          <UiIcon name="lock" size={14} />
                          <span>Password</span>
                        </button>

                        {s.active ? (
                          <button
                            type="button"
                            className="btn-table-deactivate"
                            onClick={() => handlePromptToggleStatus(s, "deactivate")}
                            title="Deactivate student account"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-table-activate"
                            onClick={() => handlePromptToggleStatus(s, "activate")}
                            title="Activate student account"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* ================= VIEW STUDENT MODAL ================= */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Student Details"
        subtitle={viewingStudent ? `Roll No: ${viewingStudent.rollNumber}` : ""}
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
        {loadingView ? (
          <div className="admin-loading-container" style={{ padding: "32px 0" }}>
            <div className="admin-loading-spinner" />
            <p>Loading student details...</p>
          </div>
        ) : viewingStudent ? (
          <div className="student-view-card">
            {viewError && (
              <div className="form-server-error" role="alert" style={{ marginBottom: "var(--space-3)" }}>
                ⚠️ {viewError}
              </div>
            )}
            <div className="student-view-header">
              <div className="student-view-avatar">
                {viewingStudent.fullName ? viewingStudent.fullName.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="student-view-title">
                <h3 className="student-view-name">{viewingStudent.fullName}</h3>
                <div className="student-view-badges">
                  <span className="room-pill">{viewingStudent.roomNumber || "—"}</span>
                  <span
                    className={`student-status-badge ${viewingStudent.active ? "active" : "inactive"}`}
                  >
                    <span className="status-dot" />
                    {viewingStudent.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="student-view-grid">
              <div className="student-view-item">
                <span className="student-view-label">Full Name</span>
                <span className="student-view-val">{viewingStudent.fullName}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Roll Number</span>
                <span className="student-view-val mono">{viewingStudent.rollNumber}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Email Address</span>
                <span className="student-view-val">{viewingStudent.email}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Mobile Number</span>
                <span className="student-view-val mono">{viewingStudent.mobileNumber || "—"}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Department</span>
                <span className="student-view-val">{viewingStudent.department || "—"}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Branch</span>
                <span className="student-view-val">{viewingStudent.branch || "—"}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Year of Study</span>
                <span className="student-view-val">{viewingStudent.yearOfStudy || "—"}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Room Number</span>
                <span className="student-view-val mono">{viewingStudent.roomNumber || "—"}</span>
              </div>

              <div className="student-view-item">
                <span className="student-view-label">Account Status</span>
                <span className="student-view-val">
                  {viewingStudent.active ? "Active (Access Enabled)" : "Inactive (Access Suspended)"}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ================= CREATE STUDENT MODAL ================= */}
      <Modal
        open={showCreateModal}
        onClose={() => !isSubmittingCreate && setShowCreateModal(false)}
        title="Register New Student"
        subtitle="Provide student personal, contact, and academic credentials"
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
              form="create-student-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingCreate}
            >
              {isSubmittingCreate ? "Creating..." : "Create Student"}
            </button>
          </>
        }
      >
        <form id="create-student-form" onSubmit={handleCreateSubmit} noValidate>
          {createServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {createServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Roll Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-rollNumber">
                Roll Number <span className="required-star">*</span>
              </label>
              <input
                id="create-rollNumber"
                type="text"
                className={`admin-form-input ${createErrors.rollNumber ? "has-error" : ""}`}
                placeholder="e.g. 21CS042"
                value={createForm.rollNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, rollNumber: e.target.value.toUpperCase() })
                }
              />
              {createErrors.rollNumber && (
                <span className="admin-field-error">{createErrors.rollNumber}</span>
              )}
            </div>

            {/* Full Name */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="create-fullName"
                type="text"
                className={`admin-form-input ${createErrors.fullName ? "has-error" : ""}`}
                placeholder="e.g. Rajesh Kumar"
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
              <label className="admin-form-label" htmlFor="create-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="create-email"
                type="email"
                className={`admin-form-input ${createErrors.email ? "has-error" : ""}`}
                placeholder="e.g. rajesh@hostelpass.edu"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
              {createErrors.email && (
                <span className="admin-field-error">{createErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-password">
                Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="create-password"
                  type={showPasswordCreate ? "text" : "password"}
                  className={`admin-form-input ${createErrors.password ? "has-error" : ""}`}
                  placeholder="Min 8 chars with letter & digit"
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
                <span className="admin-field-hint">At least 8 characters with 1 letter & 1 digit</span>
              )}
            </div>

            {/* Room Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-roomNumber">
                Room Number <span className="required-star">*</span>
              </label>
              <input
                id="create-roomNumber"
                type="text"
                className={`admin-form-input ${createErrors.roomNumber ? "has-error" : ""}`}
                placeholder="e.g. B-204"
                value={createForm.roomNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, roomNumber: e.target.value })
                }
              />
              {createErrors.roomNumber && (
                <span className="admin-field-error">{createErrors.roomNumber}</span>
              )}
            </div>

            {/* Mobile Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-mobileNumber">
                Mobile Number (10 digits) <span className="required-star">*</span>
              </label>
              <input
                id="create-mobileNumber"
                type="tel"
                maxLength={10}
                className={`admin-form-input ${createErrors.mobileNumber ? "has-error" : ""}`}
                placeholder="e.g. 9876543210"
                value={createForm.mobileNumber}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              {createErrors.mobileNumber && (
                <span className="admin-field-error">{createErrors.mobileNumber}</span>
              )}
            </div>

            {/* Branch */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-branch">
                Branch <span className="required-star">*</span>
              </label>
              <input
                id="create-branch"
                type="text"
                className={`admin-form-input ${createErrors.branch ? "has-error" : ""}`}
                placeholder="e.g. Computer Science"
                value={createForm.branch}
                onChange={(e) =>
                  setCreateForm({ ...createForm, branch: e.target.value })
                }
              />
              {createErrors.branch && (
                <span className="admin-field-error">{createErrors.branch}</span>
              )}
            </div>

            {/* Department */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="create-department">
                Department <span className="required-star">*</span>
              </label>
              <input
                id="create-department"
                type="text"
                className={`admin-form-input ${createErrors.department ? "has-error" : ""}`}
                placeholder="e.g. Engineering"
                value={createForm.department}
                onChange={(e) =>
                  setCreateForm({ ...createForm, department: e.target.value })
                }
              />
              {createErrors.department && (
                <span className="admin-field-error">{createErrors.department}</span>
              )}
            </div>

            {/* Year of Study */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="create-yearOfStudy">
                Year of Study <span className="required-star">*</span>
              </label>
              <select
                id="create-yearOfStudy"
                className="admin-form-select"
                value={createForm.yearOfStudy}
                onChange={(e) =>
                  setCreateForm({ ...createForm, yearOfStudy: e.target.value })
                }
              >
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= EDIT STUDENT MODAL ================= */}
      <Modal
        open={showEditModal}
        onClose={() => !isSubmittingEdit && setShowEditModal(false)}
        title="Edit Student Profile"
        subtitle={editingStudent ? `Updating ${editingStudent.fullName} (${editingStudent.rollNumber})` : ""}
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
              form="edit-student-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingEdit}
            >
              {isSubmittingEdit ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <form id="edit-student-form" onSubmit={handleEditSubmit} noValidate>
          {editServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {editServerError}
            </div>
          )}

          <div className="admin-form-grid">
            {/* Roll Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-rollNumber">
                Roll Number <span className="required-star">*</span>
              </label>
              <input
                id="edit-rollNumber"
                type="text"
                className={`admin-form-input ${editErrors.rollNumber ? "has-error" : ""}`}
                value={editForm.rollNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, rollNumber: e.target.value.toUpperCase() })
                }
              />
              {editErrors.rollNumber && (
                <span className="admin-field-error">{editErrors.rollNumber}</span>
              )}
            </div>

            {/* Full Name */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-fullName">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="edit-fullName"
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
              <label className="admin-form-label" htmlFor="edit-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="edit-email"
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

            {/* Room Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-roomNumber">
                Room Number <span className="required-star">*</span>
              </label>
              <input
                id="edit-roomNumber"
                type="text"
                className={`admin-form-input ${editErrors.roomNumber ? "has-error" : ""}`}
                value={editForm.roomNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, roomNumber: e.target.value })
                }
              />
              {editErrors.roomNumber && (
                <span className="admin-field-error">{editErrors.roomNumber}</span>
              )}
            </div>

            {/* Mobile Number */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-mobileNumber">
                Mobile Number <span className="required-star">*</span>
              </label>
              <input
                id="edit-mobileNumber"
                type="tel"
                maxLength={10}
                className={`admin-form-input ${editErrors.mobileNumber ? "has-error" : ""}`}
                value={editForm.mobileNumber}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    mobileNumber: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              {editErrors.mobileNumber && (
                <span className="admin-field-error">{editErrors.mobileNumber}</span>
              )}
            </div>

            {/* Branch */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-branch">
                Branch <span className="required-star">*</span>
              </label>
              <input
                id="edit-branch"
                type="text"
                className={`admin-form-input ${editErrors.branch ? "has-error" : ""}`}
                value={editForm.branch}
                onChange={(e) =>
                  setEditForm({ ...editForm, branch: e.target.value })
                }
              />
              {editErrors.branch && (
                <span className="admin-field-error">{editErrors.branch}</span>
              )}
            </div>

            {/* Department */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="edit-department">
                Department <span className="required-star">*</span>
              </label>
              <input
                id="edit-department"
                type="text"
                className={`admin-form-input ${editErrors.department ? "has-error" : ""}`}
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
              />
              {editErrors.department && (
                <span className="admin-field-error">{editErrors.department}</span>
              )}
            </div>

            {/* Year of Study */}
            <div className="admin-form-group full-width">
              <label className="admin-form-label" htmlFor="edit-yearOfStudy">
                Year of Study <span className="required-star">*</span>
              </label>
              <select
                id="edit-yearOfStudy"
                className="admin-form-select"
                value={editForm.yearOfStudy}
                onChange={(e) =>
                  setEditForm({ ...editForm, yearOfStudy: e.target.value })
                }
              >
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= CONFIRMATION DIALOG ================= */}
      <Modal
        open={showConfirmModal}
        onClose={() => !isSubmittingConfirm && setShowConfirmModal(false)}
        title={confirmAction === "deactivate" ? "Deactivate Student Account" : "Activate Student Account"}
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
                ? "Yes, Deactivate Student"
                : "Yes, Activate Student"}
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
              ? "Are you sure you want to deactivate this student account? Deactivated students will no longer be able to log in or submit new outpass requests. All past outpasses and record history are safely preserved."
              : "Are you sure you want to reactivate this student account? The student will immediately regain access to log in and submit outpass requests."}
          </p>

          {targetStudent && (
            <div className="confirm-target-box">
              <strong>{targetStudent.fullName}</strong>
              <small>Roll No: {targetStudent.rollNumber} • {targetStudent.department}</small>
            </div>
          )}
        </div>
      </Modal>

      {/* ================= RESET STUDENT PASSWORD MODAL ================= */}
      <Modal
        open={showResetPasswordModal}
        onClose={() => !isSubmittingResetPassword && setShowResetPasswordModal(false)}
        title="Reset Student Password"
        subtitle={resettingStudent ? `Set a new password for ${resettingStudent.fullName} (${resettingStudent.rollNumber})` : ""}
        footer={
          <>
            <button
              type="button"
              className="hp-btn hp-btn-secondary"
              onClick={() => setShowResetPasswordModal(false)}
              disabled={isSubmittingResetPassword}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reset-student-password-form"
              className="hp-btn hp-btn-primary"
              disabled={isSubmittingResetPassword}
            >
              {isSubmittingResetPassword ? "Resetting..." : "Reset Password"}
            </button>
          </>
        }
      >
        <form id="reset-student-password-form" onSubmit={handleResetPasswordSubmit} noValidate>
          {resetPasswordServerError && (
            <div className="form-server-error" role="alert">
              ⚠️ {resetPasswordServerError}
            </div>
          )}

          <div style={{ marginBottom: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", background: "rgba(79, 70, 229, 0.06)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid rgba(79, 70, 229, 0.18)" }}>
            ℹ️ Resetting this student's password will immediately invalidate and revoke all of their active refresh sessions.
          </div>

          <div className="admin-form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label className="admin-form-label" htmlFor="reset-student-new-password">
              New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="reset-student-new-password"
                type={showResetNewPassword ? "text" : "password"}
                className={`admin-form-input ${resetPasswordErrors.newPassword ? "has-error" : ""}`}
                placeholder="Enter new password (min. 8 characters with 1 letter & 1 number)"
                value={resetPasswordForm.newPassword}
                onChange={(e) => {
                  setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value });
                  if (resetPasswordErrors.newPassword) {
                    setResetPasswordErrors({ ...resetPasswordErrors, newPassword: "" });
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                title={showResetNewPassword ? "Hide password" : "Show password"}
              >
                <UiIcon name="eye" size={16} />
              </button>
            </div>
            {resetPasswordErrors.newPassword ? (
              <span className="admin-field-error">{resetPasswordErrors.newPassword}</span>
            ) : (
              <span className="admin-field-hint">Must be at least 8 characters with 1 letter & 1 number</span>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="reset-student-confirm-password">
              Confirm New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="reset-student-confirm-password"
                type={showResetConfirmPassword ? "text" : "password"}
                className={`admin-form-input ${resetPasswordErrors.confirmPassword ? "has-error" : ""}`}
                placeholder="Re-enter new password"
                value={resetPasswordForm.confirmPassword}
                onChange={(e) => {
                  setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value });
                  if (resetPasswordErrors.confirmPassword) {
                    setResetPasswordErrors({ ...resetPasswordErrors, confirmPassword: "" });
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                title={showResetConfirmPassword ? "Hide password" : "Show password"}
              >
                <UiIcon name="eye" size={16} />
              </button>
            </div>
            {resetPasswordErrors.confirmPassword && (
              <span className="admin-field-error">{resetPasswordErrors.confirmPassword}</span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminStudents;
