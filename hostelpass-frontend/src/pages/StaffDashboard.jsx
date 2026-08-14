import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOutpassStats } from "../services/outpassService";

import "../styles/StaffDashboard.css";

function StaffDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOutpassStats();

      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      setError("Failed to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadStats]);

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

          <button onClick={loadStats}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="staff-summary-grid">
            <div className="staff-summary-card">
              <span className="summary-number">{stats.total}</span>
              <span className="summary-title">Total Requests</span>
            </div>

            <div className="staff-summary-card">
              <span className="summary-number">{stats.pending}</span>
              <span className="summary-title">Pending</span>
            </div>

            <div className="staff-summary-card">
              <span className="summary-number">{stats.approved}</span>
              <span className="summary-title">Approved</span>
            </div>

            <div className="staff-summary-card">
              <span className="summary-number">{stats.denied}</span>
              <span className="summary-title">Denied</span>
            </div>
          </div>

          <div className="staff-overview-card">
            <div>
              <h2>Pending Outpass Requests</h2>

              {stats.pending > 0 ? (
                <p>
                  There {stats.pending === 1 ? "is" : "are"} {stats.pending}{" "}
                  request
                  {stats.pending === 1 ? "" : "s"} waiting for your review.
                </p>
              ) : (
                <p>There are currently no pending outpass requests.</p>
              )}
            </div>

            {stats.pending > 0 && (
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
