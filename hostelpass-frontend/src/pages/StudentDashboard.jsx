import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextDefinition";
import {
  getMyOutpassRequests,
  getMyOutpassStats,
} from "../services/outpassService";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const { principal } = useContext(AuthContext);
  const navigate = useNavigate();

  const [outpassRequests, setOutpassRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchOutpassRequests = async () => {
      try {
        setLoading(true);

        const [requestsResponse, statsResponse] = await Promise.all([
          getMyOutpassRequests(),
          getMyOutpassStats(),
        ]);

        setOutpassRequests(requestsResponse.data.content || []);
        setStats(statsResponse.data);
      } catch (error) {
        console.error("Failed to fetch outpass requests:", error);
        setError("Failed to load outpass requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutpassRequests();
  }, []);

  // const totalRequests = outpassRequests.length;

  // const approvedRequests = outpassRequests.filter(
  //   (request) => request.status === "APPROVED",
  // ).length;

  // const pendingRequests = outpassRequests.filter(
  //   (request) => request.status === "PENDING",
  // ).length;

  // const deniedRequests = outpassRequests.filter(
  //   (request) => request.status === "DENIED",
  // ).length;

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">STUDENT DASHBOARD</p>

          <h1>Welcome back, {principal?.fullName} 👋</h1>

          <p className="dashboard-subtitle">
            Here's an overview of your hostel outpass requests.
          </p>
        </div>

        <div className="student-info">
          <strong>{principal?.rollNumber}</strong>
          <span>Student ID: {principal?.id}</span>
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="loading">Loading your requests...</p>}

      {/* Error */}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-number">{stats.total}</span>
              <span className="summary-title">Total Requests</span>
            </div>

            <div className="summary-card">
              <span className="summary-number">{stats.approved}</span>
              <span className="summary-title">Approved</span>
            </div>

            <div className="summary-card">
              <span className="summary-number">{stats.pending}</span>
              <span className="summary-title">Pending</span>
            </div>

            <div className="summary-card">
              <span className="summary-number">{stats.denied}</span>
              <span className="summary-title">Denied</span>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="requests-section">
            <div className="section-header">
              <div>
                <h2>Recent Outpass Requests</h2>
                <p>Track the status of your applications.</p>
              </div>

              {outpassRequests.length > 0 && (
                <button
                  className="view-all-requests-button"
                  onClick={() => navigate("/student/requests")}
                  type="button"
                >
                  View All Requests
                </button>
              )}
            </div>

            {outpassRequests.length === 0 ? (
              <div className="empty-state">
                <h3>No outpass requests</h3>
                <p>You haven't submitted any outpass requests yet.</p>
              </div>
            ) : (
              <div className="request-list">
                {outpassRequests.slice(0, 5).map((request) => (
                  <div className="request-card" key={request.id}>
                    <div className="request-top">
                      <div>
                        <h3>{request.passCode}</h3>
                        <span className="request-id">
                          Request #{request.id}
                        </span>
                      </div>

                      <span
                        className={`status ${request.status.toLowerCase()}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="request-details">
                      <div>
                        <span className="detail-label">PLACE OF VISIT</span>

                        <strong>{request.placeOfVisit}</strong>
                      </div>

                      <div>
                        <span className="detail-label">PURPOSE</span>

                        <strong>{request.purpose}</strong>
                      </div>

                      <div>
                        <span className="detail-label">DEPARTURE</span>

                        <strong>{formatDate(request.departureAt)}</strong>
                      </div>

                      <div>
                        <span className="detail-label">RETURN</span>

                        <strong>{formatDate(request.returnAt)}</strong>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        className="details-button"
                        onClick={() => setSelectedRequest(request)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedRequest.passCode}</h2>
                <span>Request #{selectedRequest.id}</span>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-status">
              <span
                className={`status ${selectedRequest.status.toLowerCase()}`}
              >
                {selectedRequest.status}
              </span>
            </div>

            <div className="modal-details">
              <div>
                <span>PLACE OF VISIT</span>
                <strong>{selectedRequest.placeOfVisit}</strong>
              </div>

              <div>
                <span>PURPOSE</span>
                <strong>{selectedRequest.purpose}</strong>
              </div>

              <div>
                <span>REASON</span>
                <strong>{selectedRequest.reason || "-"}</strong>
              </div>

              <div>
                <span>DEPARTURE</span>
                <strong>{formatDate(selectedRequest.departureAt)}</strong>
              </div>

              <div>
                <span>RETURN</span>
                <strong>{formatDate(selectedRequest.returnAt)}</strong>
              </div>

              <div>
                <span>SUBMITTED</span>
                <strong>{formatDate(selectedRequest.submittedAt)}</strong>
              </div>

              <div>
                <span>DECIDED BY</span>
                <strong>{selectedRequest.decidedByStaffName || "-"}</strong>
              </div>

              <div>
                <span>DECISION REMARK</span>
                <strong>{selectedRequest.decisionRemark || "-"}</strong>
              </div>
            </div>

            <button
              className="modal-close-button"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
