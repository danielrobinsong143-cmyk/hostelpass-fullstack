import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UiIcon from "../components/UiIcon";
import { AuthContext } from "../context/authContextDefinition";
import { getOutpassStats } from "../services/outpassService";
import "../styles/StaffDashboard.css";

function StaffDashboard() {
  const navigate = useNavigate();
  const { principal } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, denied: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getOutpassStats();
      setStats(response.data);
    } catch (loadError) {
      console.error("Failed to load dashboard statistics:", loadError);
      setError("Failed to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStats(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStats]);

  const firstName = principal?.fullName?.split(" ")[0] || "there";

  return (
    <div className="dashboard-page staff-dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-heading">
          <p className="dashboard-kicker">Staff dashboard</p>
          <h1>Welcome back, {firstName}!</h1>
          <p className="dashboard-subtitle">Review and manage student outpass requests from one place.</p>
        </div>
        <div className="dashboard-header-actions">
          <button type="button" className="notification-button" aria-label="Notifications"><UiIcon name="bell" size={19} /><span className="notification-dot" /></button>
          <div className="dashboard-user-chip"><span className="dashboard-avatar dashboard-avatar-staff">{firstName.charAt(0).toUpperCase()}</span><span><strong>{principal?.fullName || "Staff member"}</strong><small>{principal?.role?.replaceAll("_", " ") || "Hostel administration"}</small></span></div>
        </div>
      </header>

      {loading && <div className="dashboard-feedback">Loading dashboard...</div>}
      {error && <div className="dashboard-feedback dashboard-feedback-error"><span>{error}</span><button type="button" onClick={loadStats}>Try Again</button></div>}

      {!loading && !error && (
        <>
          <section className="stat-strip staff-stat-strip" aria-label="Outpass statistics">
            <button type="button" className="stat-card stat-card-blue" onClick={() => navigate("/staff/requests")}><span className="stat-icon"><UiIcon name="pass" size={21} /></span><span className="stat-copy"><small>Total Requests</small><strong>{stats.total}</strong><em>All requests</em></span><UiIcon name="chart" size={27} className="stat-trend" /></button>
            <button type="button" className="stat-card stat-card-amber" onClick={() => navigate("/staff/requests?status=PENDING")}><span className="stat-icon"><UiIcon name="clock" size={21} /></span><span className="stat-copy"><small>Pending Review</small><strong>{stats.pending}</strong><em>Needs action</em></span><UiIcon name="chart" size={27} className="stat-trend" /></button>
            <button type="button" className="stat-card stat-card-green" onClick={() => navigate("/staff/requests?status=APPROVED")}><span className="stat-icon"><UiIcon name="check" size={21} /></span><span className="stat-copy"><small>Approved</small><strong>{stats.approved}</strong><em>Processed</em></span><UiIcon name="chart" size={27} className="stat-trend" /></button>
            <button type="button" className="stat-card stat-card-red" onClick={() => navigate("/staff/requests?status=DENIED")}><span className="stat-icon"><UiIcon name="x" size={21} /></span><span className="stat-copy"><small>Rejected</small><strong>{stats.denied}</strong><em>Processed</em></span><UiIcon name="chart" size={27} className="stat-trend" /></button>
          </section>

          <section className="dashboard-content-grid staff-content-grid">
            <div className="staff-overview-panel glass-panel">
              <div className="panel-heading"><div><h2>Approval overview</h2><p>Keep the student queue moving</p></div><span className="overview-shield"><UiIcon name="shield" size={19} /></span></div>
              <div className="review-summary">
                <div className="review-summary-main"><span className="review-summary-icon"><UiIcon name="clock" size={22} /></span><div><strong>{stats.pending}</strong><span>{stats.pending === 1 ? "request" : "requests"} awaiting review</span></div></div>
                <button type="button" className="primary-action" onClick={() => navigate("/staff/requests?status=PENDING")}>Review pending <UiIcon name="arrow" size={16} /></button>
              </div>
              <div className="review-progress"><div className="review-progress-label"><span>Approved requests</span><strong>{stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${stats.total ? Math.min(100, (stats.approved / stats.total) * 100) : 0}%` }} /></div></div>
            </div>

            <div className="quick-actions-panel glass-panel">
              <div className="panel-heading"><div><h2>Manage requests</h2><p>Jump into your workflow</p></div></div>
              <div className="quick-action-list">
                <button type="button" className="quick-action quick-action-amber" onClick={() => navigate("/staff/requests?status=PENDING")}><span className="quick-action-icon"><UiIcon name="clock" size={20} /></span><span><strong>Pending review</strong><small>{stats.pending} requests need attention</small></span><UiIcon name="arrow" size={16} /></button>
                <button type="button" className="quick-action quick-action-blue" onClick={() => navigate("/staff/requests")}><span className="quick-action-icon"><UiIcon name="requests" size={20} /></span><span><strong>All outpass requests</strong><small>Search and filter requests</small></span><UiIcon name="arrow" size={16} /></button>
                <button type="button" className="quick-action quick-action-purple" onClick={() => navigate("/staff/profile")}><span className="quick-action-icon"><UiIcon name="profile" size={20} /></span><span><strong>Staff profile</strong><small>Manage your account</small></span><UiIcon name="arrow" size={16} /></button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default StaffDashboard;
