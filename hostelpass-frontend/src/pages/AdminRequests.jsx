import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOutpassRequests } from "../services/outpassService";
import Pagination from "../components/Pagination";
import UiIcon from "../components/UiIcon";
import { formatDecidedBy, formatDecisionRemark } from "../utils/outpassFormatters";
import "../styles/AdminRequests.css";

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 0,
  );
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 6;

  // Sync state with URL search parameters
  useEffect(() => {
    const urlStatus = searchParams.get("status") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlFromDate = searchParams.get("fromDate") || "";
    const urlToDate = searchParams.get("toDate") || "";
    const urlPage = Number(searchParams.get("page")) || 0;

    setStatus(urlStatus);
    setSearch(urlSearch);
    setFromDate(urlFromDate);
    setToDate(urlToDate);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Load requests with debouncing
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOutpassRequests(
        currentPage,
        pageSize,
        search,
        status || undefined,
        fromDate || undefined,
        toDate || undefined,
      );

      setRequests(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error("AdminRequests error loading requests:", err);
      setError("Failed to load outpass requests.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, fromDate, toDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClass = (requestStatus) => {
    return `status-badge status-${requestStatus?.toLowerCase()}`;
  };

  const updateUrlParams = (newFilters, newPage = 0) => {
    const params = {};
    if (newFilters.status) params.status = newFilters.status;
    if (newFilters.search?.trim()) params.search = newFilters.search.trim();
    if (newFilters.fromDate) params.fromDate = newFilters.fromDate;
    if (newFilters.toDate) params.toDate = newFilters.toDate;
    if (newPage > 0) params.page = newPage;

    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);

    updateUrlParams({ status, search, fromDate, toDate }, page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (event) => {
    const val = event.target.value;
    setSearch(val);
    setCurrentPage(0);

    updateUrlParams({ status, search: val, fromDate, toDate }, 0);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setCurrentPage(0);

    updateUrlParams({ status: newStatus, search, fromDate, toDate }, 0);
  };

  const handleFromDateChange = (event) => {
    const newFrom = event.target.value;
    setFromDate(newFrom);
    setCurrentPage(0);

    updateUrlParams({ status, search, fromDate: newFrom, toDate }, 0);
  };

  const handleToDateChange = (event) => {
    const newTo = event.target.value;
    setToDate(newTo);
    setCurrentPage(0);

    updateUrlParams({ status, search, fromDate, toDate: newTo }, 0);
  };

  const handleClearFilters = () => {
    setStatus("");
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(0);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(status || search || fromDate || toDate);

  return (
    <div className="staff-requests-page admin-requests-page">
      {/* ================= HEADER ================= */}
      <div className="staff-requests-header">
        <div className="staff-requests-heading">
          <p className="page-label">ADMINISTRATION • OUTPASS MONITORING</p>
          <h1>Outpass Request Management</h1>
          <p className="page-description">
            Search, filter, and inspect campus-wide student outpass requests (Read-Only).
          </p>
        </div>

        <div className="request-count">
          <strong>{totalElements}</strong>
          <span>{status ? `${status} Requests` : "All Requests"}</span>
        </div>
      </div>

      {/* ================= SEARCH & ADVANCED FILTERS ================= */}
      <div className="admin-toolbar-advanced">
        {/* Row 1: Search Box */}
        <div className="search-wrapper">
          <span className="search-icon">
            <UiIcon name="search" size={17} />
          </span>

          <input
            type="text"
            placeholder="Search student, roll number, pass code or destination..."
            value={search}
            onChange={handleSearchChange}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => {
                setSearch("");
                setCurrentPage(0);
                updateUrlParams({ status, search: "", fromDate, toDate }, 0);
              }}
              type="button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Row 2: Filter Controls */}
        <div className="admin-filter-row">
          {/* Status Filter */}
          <div className="admin-filter-group">
            <span className="admin-filter-label">Status</span>
            <select value={status} onChange={handleStatusChange}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Departure Date From */}
          <div className="admin-filter-group">
            <span className="admin-filter-label">Departure From</span>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              max={toDate || undefined}
              aria-label="Filter departure from date"
            />
          </div>

          {/* Departure Date To */}
          <div className="admin-filter-group">
            <span className="admin-filter-label">Departure To</span>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              min={fromDate || undefined}
              aria-label="Filter departure to date"
            />
          </div>

          {/* Clear Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleClearFilters}
            >
              <UiIcon name="close" size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ================= ACTIVE FILTER CHIPS ================= */}
      {hasActiveFilters && (
        <div className="admin-active-chips">
          <span className="admin-chip-label">Active Filters:</span>
          {search && (
            <span className="admin-filter-chip">
              Search: &ldquo;{search}&rdquo;
              <button
                type="button"
                className="admin-chip-remove"
                onClick={() => {
                  setSearch("");
                  updateUrlParams({ status, search: "", fromDate, toDate }, 0);
                }}
                aria-label="Remove search filter"
              >
                ×
              </button>
            </span>
          )}
          {status && (
            <span className="admin-filter-chip">
              Status: {status}
              <button
                type="button"
                className="admin-chip-remove"
                onClick={() => {
                  setStatus("");
                  updateUrlParams({ status: "", search, fromDate, toDate }, 0);
                }}
                aria-label="Remove status filter"
              >
                ×
              </button>
            </span>
          )}
          {fromDate && (
            <span className="admin-filter-chip">
              From: {fromDate}
              <button
                type="button"
                className="admin-chip-remove"
                onClick={() => {
                  setFromDate("");
                  updateUrlParams({ status, search, fromDate: "", toDate }, 0);
                }}
                aria-label="Remove start date filter"
              >
                ×
              </button>
            </span>
          )}
          {toDate && (
            <span className="admin-filter-chip">
              To: {toDate}
              <button
                type="button"
                className="admin-chip-remove"
                onClick={() => {
                  setToDate("");
                  updateUrlParams({ status, search, fromDate, toDate: "" }, 0);
                }}
                aria-label="Remove end date filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="request-message">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      )}

      {/* ================= ERROR ================= */}
      {error && (
        <div className="request-message error">
          <div className="message-icon">!</div>
          <h3>Unable to load requests</h3>
          <p>{error}</p>
          <button onClick={loadRequests}>Try Again</button>
        </div>
      )}

      {/* ================= EMPTY ================= */}
      {!loading && !error && requests.length === 0 && (
        <div className="request-message empty">
          <div className="empty-icon">✓</div>
          <h2>{hasActiveFilters ? "No Matching Requests Found" : "No Requests Found"}</h2>
          <p>
            {hasActiveFilters
              ? "No outpass requests matched your filter criteria. Try adjusting your search keyword, status, or departure date range."
              : "There are currently no outpass requests recorded in the system."}
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
      )}

      {/* ================= REQUEST LIST ================= */}
      {!loading && !error && requests.length > 0 && (
        <>
          <div className="results-info">
            Showing{" "}
            <strong>
              {currentPage * pageSize + 1}–
              {Math.min(currentPage * pageSize + requests.length, totalElements)}
            </strong>{" "}
            of <strong>{totalElements}</strong> requests
          </div>

          <div className="staff-request-list">
            {requests.map((request) => (
              <div className="staff-request-card" key={request.id}>
                {/* CARD HEADER */}
                <div className="request-card-header">
                  <div>
                    <div className="pass-code">{request.passCode}</div>
                    <span className="request-number">Request #{request.id}</span>
                  </div>

                  <span className={getStatusClass(request.status)}>
                    {request.status}
                  </span>
                </div>

                {/* CARD DETAILS */}
                <div className="request-summary">
                  <div className="summary-item">
                    <span>STUDENT</span>
                    <strong>{request.studentName}</strong>
                  </div>

                  <div className="summary-item">
                    <span>ROLL NUMBER</span>
                    <strong>{request.rollNumber}</strong>
                  </div>

                  <div className="summary-item">
                    <span>PLACE OF VISIT</span>
                    <strong>{request.placeOfVisit}</strong>
                  </div>

                  <div className="summary-item">
                    <span>PURPOSE</span>
                    <strong>{request.purpose}</strong>
                  </div>

                  <div className="summary-item">
                    <span>DEPARTURE</span>
                    <strong>{formatDateTime(request.departureAt)}</strong>
                  </div>

                  <div className="summary-item">
                    <span>RETURN</span>
                    <strong>{formatDateTime(request.returnAt)}</strong>
                  </div>
                </div>

                {/* CARD FOOTER (READ-ONLY) */}
                <div className="admin-requests-card-footer">
                  <button
                    className="admin-view-details-btn"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <UiIcon name="eye" size={16} /> View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= PAGINATION ================= */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* ================= READ-ONLY DETAILS MODAL ================= */}
      {selectedRequest && (
        <div
          className="request-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="request-modal">
            {/* MODAL HEADER */}
            <div className="request-modal-header">
              <div>
                <p className="modal-label">OUTPASS INSPECTION</p>
                <h2>{selectedRequest.passCode}</h2>
                <span>Request #{selectedRequest.id}</span>
              </div>

              <button
                className="staff-modal-close-button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL STATUS */}
            <div className="modal-status-row">
              <span>Current Status</span>
              <span className={getStatusClass(selectedRequest.status)}>
                {selectedRequest.status}
              </span>
            </div>

            {/* MODAL DETAILS */}
            <div className="request-modal-details">
              {/* STUDENT INFORMATION */}
              <div className="modal-section-title full-width">
                Student Information
              </div>

              <div className="modal-detail">
                <span>Name</span>
                <strong>{selectedRequest.studentName}</strong>
              </div>

              <div className="modal-detail">
                <span>Roll Number</span>
                <strong>{selectedRequest.rollNumber}</strong>
              </div>

              <div className="modal-detail">
                <span>Department</span>
                <strong>{selectedRequest.department || "—"}</strong>
              </div>

              <div className="modal-detail">
                <span>Year of Study</span>
                <strong>{selectedRequest.yearOfStudy || "—"}</strong>
              </div>

              <div className="modal-detail">
                <span>Branch</span>
                <strong>{selectedRequest.branch || "—"}</strong>
              </div>

              <div className="modal-detail">
                <span>Room Number</span>
                <strong>{selectedRequest.roomNumber || "—"}</strong>
              </div>

              <div className="modal-detail">
                <span>Mobile Number</span>
                <strong>{selectedRequest.mobileNumber || "—"}</strong>
              </div>

              {/* OUTPASS INFORMATION */}
              <div className="modal-section-title full-width">
                Outpass Information
              </div>

              <div className="modal-detail">
                <span>Pass Code</span>
                <strong>{selectedRequest.passCode}</strong>
              </div>

              <div className="modal-detail">
                <span>Place of Visit</span>
                <strong>{selectedRequest.placeOfVisit}</strong>
              </div>

              <div className="modal-detail">
                <span>Purpose</span>
                <strong>{selectedRequest.purpose}</strong>
              </div>

              <div className="modal-detail full-width">
                <span>Reason</span>
                <strong>{selectedRequest.reason}</strong>
              </div>

              <div className="modal-detail">
                <span>Departure Time</span>
                <strong>{formatDateTime(selectedRequest.departureAt)}</strong>
              </div>

              <div className="modal-detail">
                <span>Return Time</span>
                <strong>{formatDateTime(selectedRequest.returnAt)}</strong>
              </div>

              <div className="modal-detail">
                <span>Submitted At</span>
                <strong>{formatDateTime(selectedRequest.submittedAt)}</strong>
              </div>

              <div className="modal-detail">
                <span>Status</span>
                <strong>{selectedRequest.status}</strong>
              </div>

              {/* DECISION INFORMATION */}
              {selectedRequest.status !== "PENDING" &&
                selectedRequest.decidedByStaffName && (
                <>
                  <div className="modal-section-title full-width">
                    Decision Information
                  </div>

                  <div className="modal-detail modal-decision-item">
                    <span>Decided By</span>
                    <strong>{formatDecidedBy(selectedRequest)}</strong>
                  </div>

                  <div className="modal-detail full-width modal-decision-item">
                    <span>Decision Remark</span>
                    <strong className="decision-remark-text">
                      {formatDecisionRemark(selectedRequest)}
                    </strong>
                  </div>
                </>
              )}
            </div>

            {/* MODAL FOOTER (READ-ONLY — NO APPROVE/DENY) */}
            <div className="admin-modal-footer-readonly">
              <button
                className="modal-close-action"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRequests;
