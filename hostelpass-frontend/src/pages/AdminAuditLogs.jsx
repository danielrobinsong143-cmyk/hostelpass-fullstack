import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAdminAuditLogs } from "../services/adminAuditLogService";
import Pagination from "../components/Pagination";
import UiIcon from "../components/UiIcon";
import { formatAuditDecisionRemark, formatDecidedBy } from "../utils/outpassFormatters";
import "../styles/AdminAuditLogs.css";

function formatDateTime(dateStr) {
  if (!dateStr) return { date: "—", time: "" };
  try {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: dateStr, time: "" };
  }
}

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 0,
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [action, setAction] = useState(searchParams.get("action") || "");

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 10;

  // Sync state with URL query parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlAction = searchParams.get("action") || "";
    const urlPage = Number(searchParams.get("page")) || 0;

    setSearch(urlSearch);
    setAction(urlAction);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Load audit logs from backend
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAuditLogs(
        currentPage,
        pageSize,
        search,
        action,
      );

      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(
        typeof response.data.totalElements === "number"
          ? response.data.totalElements
          : (response.data.content || []).length,
      );
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError("Unable to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, action]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Update URL search parameters
  const updateUrlParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || (key === "page" && val === 0)) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    updateUrlParams({ search: val, page: 0 });
  };

  const handleClearSearch = () => {
    setSearch("");
    updateUrlParams({ search: "", page: 0 });
  };

  const handleActionChange = (e) => {
    const val = e.target.value;
    setAction(val);
    updateUrlParams({ action: val, page: 0 });
  };

  const handleClearFilters = () => {
    setSearch("");
    setAction("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(search || action);

  return (
    <div className="admin-audit-page">
      {/* Header */}
      <div className="admin-audit-header">
        <div>
          <div className="page-label">System Auditing</div>
          <h1>Audit Activity History</h1>
          <p>
            Permanent, immutable record of staff decisions and outpass approvals across HostelPass
          </p>
        </div>
        <div className="admin-audit-count">
          Showing <strong>{logs.length}</strong> of <strong>{totalElements}</strong> audit records
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-audit-toolbar">
        {/* Row 1: Search */}
        <div className="admin-audit-search-row">
          <div className="admin-audit-search-box">
            <UiIcon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by staff name, student name, roll number, pass code, or remark..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search audit records"
            />
            {search && (
              <button
                type="button"
                className="admin-audit-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search query"
              >
                <UiIcon name="x" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Action Filter & Clear */}
        <div className="admin-audit-filter-row">
          <div className="admin-audit-filter-group">
            <span className="admin-audit-filter-label">Action</span>
            <select value={action} onChange={handleActionChange} aria-label="Filter by decision action">
              <option value="">All Actions</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="admin-audit-clear-btn"
              onClick={handleClearFilters}
            >
              <UiIcon name="close" size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="admin-audit-chips">
          <span className="admin-audit-chip-label">Active Filters:</span>
          {search && (
            <span className="admin-audit-chip">
              Search: “{search}”
              <button
                type="button"
                className="admin-audit-chip-remove"
                onClick={handleClearSearch}
                aria-label="Remove search filter"
              >
                <UiIcon name="close" size={12} />
              </button>
            </span>
          )}
          {action && (
            <span className="admin-audit-chip">
              Action: {action}
              <button
                type="button"
                className="admin-audit-chip-remove"
                onClick={() => {
                  setAction("");
                  updateUrlParams({ action: "", page: 0 });
                }}
                aria-label="Remove action filter"
              >
                <UiIcon name="close" size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="request-message error" role="alert" style={{ marginBottom: 20 }}>
          <span>{error}</span>
          <button type="button" className="retry-btn" onClick={loadLogs} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-state" style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading audit activity records...</p>
        </div>
      ) : logs.length === 0 ? (
        /* Empty State */
        <div className="admin-audit-card">
          <div className="admin-audit-empty">
            <UiIcon name="clock" size={40} />
            <h3>No audit records found</h3>
            <p>
              {hasActiveFilters
                ? "No audit records match your current filter parameters."
                : "No outpass decisions have been recorded by staff yet."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-empty-action"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Table Card */
        <div className="admin-audit-card">
          <div className="admin-audit-table-wrapper">
            <table className="admin-audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Decision Maker</th>
                  <th>Request Reference</th>
                  <th>Student</th>
                  <th>Transition</th>
                  <th>Decision Remark</th>
                  <th style={{ textAlign: "right" }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const dt = formatDateTime(log.performedAt);
                  const actionClass = log.action ? log.action.toLowerCase() : "approved";

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      title="Click to view full immutable audit details"
                    >
                      <td>
                        <div className="audit-time-cell">
                          <span className="audit-time-date">{dt.date}</span>
                          <span className="audit-time-clock">{dt.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`audit-badge ${actionClass}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <div className="audit-actor-badge">
                          <UiIcon name="shield" size={14} />
                          <span>{log.actorStaffName || "Staff"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="audit-req-tag">
                          <span className="audit-req-code">
                            {log.passCode || `OP-${log.outpassRequestId}`}
                          </span>
                          <span className="audit-req-id">
                            Req #{log.outpassRequestId}
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong>{log.studentName || "Resident"}</strong>
                      </td>
                      <td>
                        <span className="audit-transition-pill">
                          {log.previousStatus} → {log.newStatus}
                        </span>
                      </td>
                      <td>
                        <div
                          className="audit-remark-preview"
                          title={formatAuditDecisionRemark(log) !== "—" ? formatAuditDecisionRemark(log) : "No remark provided"}
                        >
                          {formatAuditDecisionRemark(log) !== "—" ? `“${formatAuditDecisionRemark(log)}”` : "—"}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="audit-action-btn"
                          onClick={() => setSelectedLog(log)}
                        >
                          <UiIcon name="eye" size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Inspection Modal */}
      {selectedLog && (
        <div
          className="audit-modal-backdrop"
          onClick={() => setSelectedLog(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-modal-title"
        >
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="audit-modal-header">
              <h2 id="audit-modal-title">
                <UiIcon name="clock" size={19} />
                Audit Record #{selectedLog.id}
              </h2>
              <button
                type="button"
                className="audit-modal-close"
                onClick={() => setSelectedLog(null)}
                aria-label="Close audit details modal"
              >
                <UiIcon name="close" size={18} />
              </button>
            </div>

            <div className="audit-modal-body">
              <div className="audit-modal-banner">
                <div>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Decision Action
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <span className={`audit-badge ${selectedLog.action ? selectedLog.action.toLowerCase() : "approved"}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Status Transition
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <span className="audit-transition-pill">
                      {selectedLog.previousStatus} → {selectedLog.newStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-modal-grid">
                <div className="audit-modal-item">
                  <label>Audit Entry ID</label>
                  <span>#{selectedLog.id}</span>
                </div>

                <div className="audit-modal-item">
                  <label>Performed At</label>
                  <span>
                    {formatDateTime(selectedLog.performedAt).date} at {formatDateTime(selectedLog.performedAt).time}
                  </span>
                </div>

                <div className="audit-modal-item">
                  <label>Decision Maker</label>
                  <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UiIcon name="shield" size={14} />
                    {formatDecidedBy(selectedLog)}
                  </strong>
                </div>

                <div className="audit-modal-item">
                  <label>Outpass Request</label>
                  <span>
                    {selectedLog.passCode ? `${selectedLog.passCode} ` : ""}
                    (Req #{selectedLog.outpassRequestId})
                  </span>
                </div>

                {selectedLog.studentName && (
                  <div className="audit-modal-item audit-modal-item-full">
                    <label>Student</label>
                    <strong>{selectedLog.studentName}</strong>
                  </div>
                )}

                <div className="audit-modal-item audit-modal-item-full">
                  <label>Decision Remark</label>
                  <div className="audit-modal-remark-box">
                    {formatAuditDecisionRemark(selectedLog) !== "—"
                      ? `“${formatAuditDecisionRemark(selectedLog)}”`
                      : "No decision remark was provided."}
                  </div>
                </div>
              </div>

              <div className="audit-modal-notice">
                <UiIcon name="shield" size={16} />
                <span>
                  Immutable Record: System-logged upon staff decision. Cannot be edited, revoked, or deleted.
                </span>
              </div>
            </div>

            <div className="audit-modal-footer">
              <button
                type="button"
                className="audit-modal-btn-close"
                onClick={() => setSelectedLog(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAuditLogs;
