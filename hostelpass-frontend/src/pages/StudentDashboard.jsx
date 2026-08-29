import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import { AuthContext } from "../context/authContextDefinition";
import { getMyOutpassRequests, getMyOutpassStats } from "../services/outpassService";
import "../styles/StudentDashboard.css";

const statusMeta = {
  APPROVED: { label: "Approved", tone: "approved", icon: "check" },
  PENDING: { label: "Pending", tone: "pending", icon: "clock" },
  DENIED: { label: "Rejected", tone: "denied", icon: "x" },
  REJECTED: { label: "Rejected", tone: "denied", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "cancelled", icon: "x" },
};

function getStatusMeta(status) {
  return statusMeta[String(status || "").toUpperCase()] || { label: status || "Submitted", tone: "neutral", icon: "clock" };
}

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

function StudentDashboard() {
  const { principal } = useContext(AuthContext);
  const navigate = useNavigate();
  const [outpassRequests, setOutpassRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, denied: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchOutpassRequests = async () => {
      try {
        setLoading(true);
        const [requestsResponse, statsResponse] = await Promise.all([getMyOutpassRequests(), getMyOutpassStats()]);
        setOutpassRequests(requestsResponse.data.content || []);
        setStats(statsResponse.data);
      } catch (requestError) {
        console.error("Failed to fetch outpass requests:", requestError);
        setError("Failed to load outpass requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutpassRequests();
  }, []);

  const firstName = principal?.fullName?.split(" ")[0] || "there";
  const displayRequests = outpassRequests.slice(0, 5);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-heading">
          <p className="dashboard-kicker">Student dashboard</p>
          <h1>Welcome back, {firstName}!</h1>
          <p className="dashboard-subtitle">Here&apos;s an overview of your hostel outpass requests.</p>
        </div>
        <div className="dashboard-header-actions">
          <button type="button" className="notification-button" aria-label="Notifications">
            <UiIcon name="bell" size={19} />
            <span className="notification-dot" />
          </button>
          <div className="dashboard-user-chip">
            <span className="dashboard-avatar">{firstName.charAt(0).toUpperCase()}</span>
            <span><strong>{principal?.fullName || "Student"}</strong><small>{principal?.rollNumber || "Student account"}</small></span>
          </div>
        </div>
      </header>

      {loading && <div className="dashboard-feedback">Loading your requests...</div>}
      {error && <div className="dashboard-feedback dashboard-feedback-error">{error}</div>}

      {!loading && !error && (
        <>
          <section className="stat-strip" aria-label="Request statistics">
            <div className="stat-card stat-card-blue">
              <span className="stat-icon"><UiIcon name="pass" size={21} /></span>
              <span className="stat-copy"><small>Total Requests</small><strong>{stats.total}</strong><em>All time</em></span>
              <UiIcon name="chart" size={27} className="stat-trend" />
            </div>
            <div className="stat-card stat-card-green">
              <span className="stat-icon"><UiIcon name="check" size={21} /></span>
              <span className="stat-copy"><small>Approved</small><strong>{stats.approved}</strong><em>This month</em></span>
              <UiIcon name="chart" size={27} className="stat-trend" />
            </div>
            <div className="stat-card stat-card-amber">
              <span className="stat-icon"><UiIcon name="clock" size={21} /></span>
              <span className="stat-copy"><small>Pending</small><strong>{stats.pending}</strong><em>Currently</em></span>
              <UiIcon name="chart" size={27} className="stat-trend" />
            </div>
            <div className="stat-card stat-card-red">
              <span className="stat-icon"><UiIcon name="x" size={21} /></span>
              <span className="stat-copy"><small>Rejected</small><strong>{stats.denied}</strong><em>This month</em></span>
              <UiIcon name="chart" size={27} className="stat-trend" />
            </div>
          </section>

          <section className="dashboard-content-grid">
            <div className="requests-panel glass-panel">
              <div className="panel-heading">
                <div><h2>Recent Requests</h2><p>Your latest outpass applications</p></div>
                {outpassRequests.length > 0 && <button type="button" className="panel-link" onClick={() => navigate("/student/requests")}>View All <UiIcon name="arrow" size={15} /></button>}
              </div>

              {displayRequests.length === 0 ? (
                <div className="dashboard-empty-state"><span className="empty-icon"><UiIcon name="pass" size={23} /></span><h3>No outpass requests yet</h3><p>Submit your first request to see it here.</p><button type="button" className="primary-action" onClick={() => navigate("/student/apply-outpass")}>Apply for Outpass <UiIcon name="arrow" size={16} /></button></div>
              ) : (
                <div className="recent-request-list">
                  {displayRequests.map((request) => {
                    const status = getStatusMeta(request.status);
                    const requestDate = requestDateParts(request.departureAt || request.submittedAt);
                    return (
                      <button type="button" className="recent-request-row" key={request.id} onClick={() => setSelectedRequest(request)}>
                        <span className="request-date"><strong>{requestDate.month}</strong><b>{requestDate.day}</b></span>
                        <span className="request-summary"><strong>{request.purpose || "Outpass request"}</strong><small>{request.placeOfVisit || "Destination not provided"}</small></span>
                        <span className={`status-pill ${status.tone}`}><UiIcon name={status.icon} size={13} />{status.label}</span>
                        <span className="request-time">{formatDate(request.departureAt, { time: true }).split(", ").slice(-1)[0] || "View details"}</span>
                        <UiIcon name="arrow" size={16} className="row-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="quick-actions-panel glass-panel">
              <div className="panel-heading"><div><h2>Quick Actions</h2><p>Common student tasks</p></div></div>
              <div className="quick-action-list">
                <button type="button" className="quick-action quick-action-blue" onClick={() => navigate("/student/apply-outpass")}><span className="quick-action-icon"><UiIcon name="pass" size={20} /></span><span><strong>Apply for Outpass</strong><small>New outpass request</small></span><UiIcon name="arrow" size={16} /></button>
                <button type="button" className="quick-action quick-action-green" onClick={() => navigate("/student/requests")}><span className="quick-action-icon"><UiIcon name="requests" size={20} /></span><span><strong>My Requests</strong><small>View all your requests</small></span><UiIcon name="arrow" size={16} /></button>
                <button type="button" className="quick-action quick-action-purple" onClick={() => navigate("/student/profile")}><span className="quick-action-icon"><UiIcon name="profile" size={20} /></span><span><strong>Profile</strong><small>Manage your profile</small></span><UiIcon name="arrow" size={16} /></button>
              </div>
            </div>
          </section>
        </>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="details-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="modal-kicker">Outpass request</p><h2>{selectedRequest.passCode}</h2><span>Request #{selectedRequest.id}</span></div><button type="button" className="close-button" onClick={() => setSelectedRequest(null)} aria-label="Close details"><UiIcon name="close" size={20} /></button></div>
            <div className="modal-status"><span className={`status-pill ${getStatusMeta(selectedRequest.status).tone}`}>{getStatusMeta(selectedRequest.status).label}</span></div>
            <div className="modal-details">
              <div><span>Place of visit</span><strong>{selectedRequest.placeOfVisit}</strong></div>
              <div><span>Purpose</span><strong>{selectedRequest.purpose}</strong></div>
              <div><span>Reason</span><strong>{selectedRequest.reason || "-"}</strong></div>
              <div><span>Departure</span><strong>{formatDate(selectedRequest.departureAt)}</strong></div>
              <div><span>Return</span><strong>{formatDate(selectedRequest.returnAt)}</strong></div>
              <div><span>Submitted</span><strong>{formatDate(selectedRequest.submittedAt)}</strong></div>
              <div><span>Decided by</span><strong>{selectedRequest.decidedByStaffName || "-"}</strong></div>
              <div><span>Decision remark</span><strong>{selectedRequest.decisionRemark || "-"}</strong></div>
            </div>
            <button type="button" className="modal-close-action" onClick={() => setSelectedRequest(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
