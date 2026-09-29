import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { AuthContext } from "../context/authContextDefinition";
import { getOutpassStats, getOutpassRequests } from "../services/outpassService";
import { getAdminStudents } from "../services/adminStudentService";
import { getAdminStaff } from "../services/adminStaffService";
import { getAdminAdmins } from "../services/adminAdminService";
import { getAdminAuditLogs } from "../services/adminAuditLogService";
import "../styles/AdminDashboard.css";

function formatDate(dateTime, options = {}) {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: options.year === false ? undefined : "numeric",
    hour: options.time === false ? undefined : "2-digit",
    minute: options.time === false ? undefined : "2-digit",
  });
}

function requestDateParts(dateTime) {
  if (!dateTime) return { month: "—", day: "—" };
  const date = new Date(dateTime);
  return {
    month: date.toLocaleString("en-IN", { month: "short" }),
    day: date.getDate(),
  };
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { principal } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalAdmins: 0,
    totalRequests: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    cancelled: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        outpassStatsRes,
        studentsRes,
        staffRes,
        adminsRes,
        requestsRes,
        auditLogsRes,
      ] = await Promise.allSettled([
        getOutpassStats(),
        getAdminStudents(0, 1),
        getAdminStaff(0, 1),
        getAdminAdmins(0, 1),
        getOutpassRequests(0, 5),
        getAdminAuditLogs(0, 5),
      ]);

      const outpassData =
        outpassStatsRes.status === "fulfilled" ? outpassStatsRes.value.data : {};
      const totalStudents =
        studentsRes.status === "fulfilled" ? studentsRes.value.data.totalElements || 0 : 0;
      const totalStaff =
        staffRes.status === "fulfilled" ? staffRes.value.data.totalElements || 0 : 0;
      const totalAdmins =
        adminsRes.status === "fulfilled" ? adminsRes.value.data.totalElements || 0 : 0;

      setStats({
        totalStudents,
        totalStaff,
        totalAdmins,
        totalRequests: outpassData.total ?? 0,
        pending: outpassData.pending ?? 0,
        approved: outpassData.approved ?? 0,
        denied: outpassData.denied ?? 0,
        cancelled: outpassData.cancelled ?? 0,
      });

      if (requestsRes.status === "fulfilled") {
        setRecentRequests(requestsRes.value.data.content || []);
      }

      if (auditLogsRes.status === "fulfilled") {
        setRecentAuditLogs(auditLogsRes.value.data.content || []);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard information:", err);
      setError("Failed to load admin dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboardData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboardData]);

  const firstName = principal?.fullName?.split(" ")[0] || "Administrator";

  return (
    <div className="dashboard-page admin-dashboard-page">
      {/* ================= HEADER ================= */}
      <header className="dashboard-header">
        <div className="dashboard-heading">
          <p className="dashboard-kicker admin-kicker">Super Admin Console</p>
          <h1>Welcome back, {firstName}!</h1>
          <p className="dashboard-subtitle">
            System-wide directory overview, outpass statistics, and administration portal.
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="notification-button"
            aria-label="Notifications"
          >
            <UiIcon name="bell" size={19} />
            <span className="notification-dot" />
          </button>
          <div className="dashboard-user-chip">
            <span className="dashboard-avatar dashboard-avatar-admin">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span>
              <strong>{principal?.fullName || "Super Admin"}</strong>
              <small>System Controller</small>
            </span>
          </div>
        </div>
      </header>

      {/* ================= FEEDBACK STATES ================= */}
      {loading && <div className="dashboard-feedback">Loading admin dashboard...</div>}
      {error && (
        <div className="dashboard-feedback dashboard-feedback-error">
          <span>{error}</span>
          <button type="button" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ================= DIRECTORY OVERVIEW ================= */}
          <section aria-label="System Directory Overview">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">
                  <UiIcon name="users" size={18} /> Directory Overview
                </h2>
                <p className="admin-section-subtitle">
                  Managed accounts currently active across the system
                </p>
              </div>
            </div>

            <div className="admin-entity-strip">
              <button
                type="button"
                className="stat-card stat-card-indigo"
                onClick={() => navigate("/admin/students")}
              >
                <span className="stat-icon">
                  <UiIcon name="users" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Total Students</small>
                  <strong>{stats.totalStudents}</strong>
                  <em>Registered in hostel</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>

              <button
                type="button"
                className="stat-card stat-card-purple"
                onClick={() => navigate("/admin/staff")}
              >
                <span className="stat-icon">
                  <UiIcon name="shield" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Total Staff</small>
                  <strong>{stats.totalStaff}</strong>
                  <em>Wardens &amp; Authorities</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>

              <button
                type="button"
                className="stat-card stat-card-teal"
                onClick={() => navigate("/admin/admins")}
              >
                <span className="stat-icon">
                  <UiIcon name="lock" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Total Admins</small>
                  <strong>{stats.totalAdmins}</strong>
                  <em>Super Admin accounts</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>
            </div>
          </section>

          {/* ================= OUTPASS METRICS ================= */}
          <section aria-label="Outpass Request Statistics">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">
                  <UiIcon name="pass" size={18} /> Outpass Activity
                </h2>
                <p className="admin-section-subtitle">
                  Campus-wide outpass requests and clearance status
                </p>
              </div>
            </div>

            <div className="admin-outpass-strip">
              <button
                type="button"
                className="stat-card stat-card-blue"
                onClick={() => navigate("/admin/requests")}
              >
                <span className="stat-icon">
                  <UiIcon name="pass" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Total Requests</small>
                  <strong>{stats.totalRequests}</strong>
                  <em>All applications</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>

              <button
                type="button"
                className="stat-card stat-card-amber"
                onClick={() => navigate("/admin/requests?status=PENDING")}
              >
                <span className="stat-icon">
                  <UiIcon name="clock" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Pending Review</small>
                  <strong>{stats.pending}</strong>
                  <em>Requires action</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>

              <button
                type="button"
                className="stat-card stat-card-green"
                onClick={() => navigate("/admin/requests?status=APPROVED")}
              >
                <span className="stat-icon">
                  <UiIcon name="check" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Approved</small>
                  <strong>{stats.approved}</strong>
                  <em>Issued passes</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>

              <button
                type="button"
                className="stat-card stat-card-red"
                onClick={() => navigate("/admin/requests?status=DENIED")}
              >
                <span className="stat-icon">
                  <UiIcon name="x" size={21} />
                </span>
                <span className="stat-copy">
                  <small>Denied</small>
                  <strong>{stats.denied}</strong>
                  <em>Rejected passes</em>
                </span>
                <UiIcon name="chart" size={27} className="stat-trend" />
              </button>
            </div>
          </section>

          {/* ================= MANAGEMENT NAVIGATION ================= */}
          <section aria-label="Management Navigation Hub">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">
                  <UiIcon name="dashboard" size={18} /> Management Hub
                </h2>
                <p className="admin-section-subtitle">
                  Direct navigation to administrative management features
                </p>
              </div>
            </div>

            <div className="admin-nav-grid">
              <div
                className="admin-nav-card"
                onClick={() => navigate("/admin/students")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/admin/students")}
              >
                <div className="admin-nav-card-top">
                  <span className="admin-nav-icon stat-card-indigo">
                    <UiIcon name="users" size={22} />
                  </span>
                  <div>
                    <h3>Student Management</h3>
                    <p>Register, update, activate or deactivate students and reset passwords.</p>
                  </div>
                </div>
                <div className="admin-nav-action">
                  <span>Manage Students</span>
                  <UiIcon name="arrow" size={15} />
                </div>
              </div>

              <div
                className="admin-nav-card"
                onClick={() => navigate("/admin/staff")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/admin/staff")}
              >
                <div className="admin-nav-card-top">
                  <span className="admin-nav-icon stat-card-purple">
                    <UiIcon name="shield" size={22} />
                  </span>
                  <div>
                    <h3>Staff Management</h3>
                    <p>Manage wardens, principals, deans, and authorities with custom roles.</p>
                  </div>
                </div>
                <div className="admin-nav-action">
                  <span>Manage Staff</span>
                  <UiIcon name="arrow" size={15} />
                </div>
              </div>

              <div
                className="admin-nav-card"
                onClick={() => navigate("/admin/admins")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/admin/admins")}
              >
                <div className="admin-nav-card-top">
                  <span className="admin-nav-icon stat-card-teal">
                    <UiIcon name="lock" size={22} />
                  </span>
                  <div>
                    <h3>Admin Management</h3>
                    <p>Control Super Admin security credentials, access levels, and status.</p>
                  </div>
                </div>
                <div className="admin-nav-action">
                  <span>Manage Admins</span>
                  <UiIcon name="arrow" size={15} />
                </div>
              </div>

              <div
                className="admin-nav-card"
                onClick={() => navigate("/admin/requests")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/admin/requests")}
              >
                <div className="admin-nav-card-top">
                  <span className="admin-nav-icon stat-card-blue">
                    <UiIcon name="requests" size={22} />
                  </span>
                  <div>
                    <h3>Outpass Requests</h3>
                    <p>Inspect incoming outpass queue, view reasons, approve or reject passes.</p>
                  </div>
                </div>
                <div className="admin-nav-action">
                  <span>Review Requests</span>
                  <UiIcon name="arrow" size={15} />
                </div>
              </div>

              <div
                className="admin-nav-card"
                onClick={() => navigate("/admin/profile")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/admin/profile")}
              >
                <div className="admin-nav-card-top">
                  <span className="admin-nav-icon stat-card-amber">
                    <UiIcon name="profile" size={22} />
                  </span>
                  <div>
                    <h3>Admin Profile</h3>
                    <p>Review administrator account details and update personal password.</p>
                  </div>
                </div>
                <div className="admin-nav-action">
                  <span>My Profile</span>
                  <UiIcon name="arrow" size={15} />
                </div>
              </div>
            </div>
          </section>

          {/* ================= RECENT ACTIVITY & AUDIT TRAIL ================= */}
          <section aria-label="Recent System Activity">
            <div className="glass-panel admin-activity-panel">
              <div className="admin-tabs-bar">
                <button
                  type="button"
                  className={`admin-tab-btn ${activeTab === "requests" ? "active" : ""}`}
                  onClick={() => setActiveTab("requests")}
                >
                  <UiIcon name="requests" size={16} />
                  <span>Recent Outpass Requests</span>
                  <span className="admin-tab-count">{recentRequests.length}</span>
                </button>
                <button
                  type="button"
                  className={`admin-tab-btn ${activeTab === "audit" ? "active" : ""}`}
                  onClick={() => setActiveTab("audit")}
                >
                  <UiIcon name="shield" size={16} />
                  <span>Audit Activity Log</span>
                  <span className="admin-tab-count">{recentAuditLogs.length}</span>
                </button>
              </div>

              {/* Tab 1: Recent Outpass Requests */}
              {activeTab === "requests" && (
                <div>
                  <div className="panel-heading">
                    <div>
                      <h2>Recent Student Outpasses</h2>
                      <p>Latest applications submitted by hostel residents</p>
                    </div>
                    <button
                      type="button"
                      className="panel-link"
                      onClick={() => navigate("/admin/requests")}
                    >
                      View all requests <UiIcon name="arrow" size={14} />
                    </button>
                  </div>

                  {recentRequests.length === 0 ? (
                    <EmptyState
                      title="No outpass requests found"
                      message="No student applications have been submitted yet."
                    />
                  ) : (
                    <div className="recent-request-list">
                      {recentRequests.map((req) => {
                        const dateParts = requestDateParts(req.departureAt);
                        return (
                          <div
                            key={req.id}
                            className="recent-request-row"
                            onClick={() => setSelectedRequest(req)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setSelectedRequest(req)}
                          >
                            <div className="request-date">
                              <strong>{dateParts.month}</strong>
                              <b>{dateParts.day}</b>
                            </div>
                            <div className="request-summary">
                              <strong>
                                {req.studentName} ({req.rollNumber})
                              </strong>
                              <small>
                                {req.placeOfVisit} • {req.purpose}
                              </small>
                            </div>
                            <StatusBadge status={req.status} />
                            <span className="request-time">
                              {formatDate(req.submittedAt, { year: false })}
                            </span>
                            <UiIcon name="arrow" size={16} className="row-arrow" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: System Audit Logs */}
              {activeTab === "audit" && (
                <div>
                  <div className="panel-heading">
                    <div>
                      <h2>Audit Activity Log</h2>
                      <p>Actions performed by staff on outpass applications</p>
                    </div>
                    <button
                      type="button"
                      className="panel-link"
                      onClick={() => navigate("/admin/audit-logs")}
                    >
                      View all audit logs <UiIcon name="arrow" size={14} />
                    </button>
                  </div>

                  {recentAuditLogs.length === 0 ? (
                    <EmptyState
                      title="No audit logs recorded yet"
                      message="System audit entries will appear here as administrative actions (approvals, rejections) take place."
                    />
                  ) : (
                    <div className="admin-audit-list">
                      {recentAuditLogs.map((log) => (
                        <div key={log.id} className="admin-audit-row">
                          <StatusBadge status={log.action} />
                          <div className="admin-audit-info">
                            <strong>
                              {log.actorStaffName} processed Request #{log.outpassRequestId}
                            </strong>
                            <span>{log.remark ? `“${log.remark}”` : "No remark provided"}</span>
                          </div>
                          <span className="admin-audit-transition">
                            {log.previousStatus} → {log.newStatus}
                          </span>
                          <span className="admin-audit-time">
                            {formatDate(log.performedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ================= REQUEST DETAILS MODAL ================= */}
      {selectedRequest && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRequest(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-kicker">Outpass Details</p>
                <h2>Pass Code: {selectedRequest.passCode || `ID #${selectedRequest.id}`}</h2>
                <span>
                  Submitted by {selectedRequest.studentName} on{" "}
                  {formatDate(selectedRequest.submittedAt)}
                </span>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close details"
              >
                <UiIcon name="close" size={18} />
              </button>
            </div>

            <div className="modal-status">
              <StatusBadge status={selectedRequest.status} />
            </div>

            <div className="modal-details">
              <div>
                <span>Roll Number</span>
                <strong>{selectedRequest.rollNumber}</strong>
              </div>
              <div>
                <span>Room / Branch</span>
                <strong>
                  {selectedRequest.roomNumber} ({selectedRequest.branch})
                </strong>
              </div>
              <div>
                <span>Place of Visit</span>
                <strong>{selectedRequest.placeOfVisit}</strong>
              </div>
              <div>
                <span>Purpose</span>
                <strong>{selectedRequest.purpose}</strong>
              </div>
              <div>
                <span>Departure Time</span>
                <strong>{formatDate(selectedRequest.departureAt)}</strong>
              </div>
              <div>
                <span>Expected Return</span>
                <strong>{formatDate(selectedRequest.returnAt)}</strong>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span>Detailed Reason</span>
                <strong>{selectedRequest.reason || "No detailed reason provided."}</strong>
              </div>
              {selectedRequest.decidedByStaffName && (
                <div style={{ gridColumn: "span 2" }}>
                  <span>Decided By</span>
                  <strong>
                    {selectedRequest.decidedByStaffName} at{" "}
                    {formatDate(selectedRequest.decidedAt)}
                  </strong>
                  {selectedRequest.decisionRemark && (
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
                      Remark: {selectedRequest.decisionRemark}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="modal-close-action"
              onClick={() => setSelectedRequest(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
