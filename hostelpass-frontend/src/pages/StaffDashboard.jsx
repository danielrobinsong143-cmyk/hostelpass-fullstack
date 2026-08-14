import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOutpassRequests } from "../services/outpassService";

import "../styles/StaffDashboard.css";

function StaffDashboard() {
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOutpassRequests(0, 1, "", "PENDING");

      setPendingCount(response.data.totalElements ?? 0);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
      setError("Failed to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPendingRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPendingRequests]);

  return (
    <div className="staff-dashboard">
      <div className="staff-header">
        <div>
          <p className="dashboard-label">STAFF DASHBOARD</p>

          <h1>Welcome to Staff Dashboard 👋</h1>

          <p>Review and manage student outpass requests.</p>
        </div>
      </div>

      {loading && <div className="message">Loading dashboard...</div>}

      {error && (
        <div className="message error">
          <p>{error}</p>

          <button onClick={loadPendingRequests}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="staff-summary-grid">
            <div className="staff-summary-card">
              <span className="summary-number">{pendingCount}</span>

              <span className="summary-title">Pending Requests</span>
            </div>
          </div>

          <div className="staff-overview-card">
            <div>
              <h2>Pending Outpass Requests</h2>

              {pendingCount > 0 ? (
                <p>
                  There {pendingCount === 1 ? "is" : "are"} {pendingCount}{" "}
                  request
                  {pendingCount === 1 ? "" : "s"} waiting for your review.
                </p>
              ) : (
                <p>There are currently no pending outpass requests.</p>
              )}
            </div>

            {pendingCount > 0 && (
              <button
                className="view-requests-button"
                onClick={() => navigate("/staff/requests")}
              >
                View Pending Requests
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StaffDashboard;
