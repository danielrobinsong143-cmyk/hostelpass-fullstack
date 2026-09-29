import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOutpassRequests } from "../services/outpassService";
import Pagination from "../components/Pagination";
import UiIcon from "../components/UiIcon";
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

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 6;

  useEffect(() => {
    const urlStatus = searchParams.get("status") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlPage = Number(searchParams.get("page")) || 0;

    setStatus(urlStatus);
    setSearch(urlSearch);
    setCurrentPage(urlPage);
  }, [searchParams]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOutpassRequests(
        currentPage,
        pageSize,
        search,
        status || undefined,
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
  }, [currentPage, search, status]);

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

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);

    const newParams = {};
    if (status) newParams.status = status;
    if (search) newParams.search = search;
    if (page > 0) newParams.page = page;
    setSearchParams(newParams);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (event) => {
    const val = event.target.value;
    setSearch(val);
    setCurrentPage(0);

    const newParams = {};
    if (status) newParams.status = status;
    if (val.trim()) newParams.search = val;
    setSearchParams(newParams);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    setCurrentPage(0);

    const newParams = {};
    if (newStatus) newParams.status = newStatus;
    if (search.trim()) newParams.search = search;
    setSearchParams(newParams);
  };

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

      {/* ================= SEARCH & STATUS FILTER ================= */}
      <div className="request-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">
            <UiIcon name="search" size={17} />
          </span>

          <input
            type="text"
            placeholder="Search student, roll number, pass code or place..."
            value={search}
            onChange={handleSearchChange}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => {
                setSearch("");
                setCurrentPage(0);
                const newParams = {};
                if (status) newParams.status = status;
                setSearchParams(newParams);
              }}
              type="button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-wrapper">
          <span className="filter-label">Status</span>

          <select value={status} onChange={handleStatusChange}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DENIED">Denied</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

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
          <h2>No Requests Found</h2>
          <p>
            {search || status
              ? "Try changing your search keywords or status filter."
              : "There are currently no outpass requests recorded in the system."}
          </p>
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
              {(selectedRequest.decidedByStaffName ||
                selectedRequest.decisionRemark ||
                selectedRequest.decidedAt) && (
                <>
                  <div className="modal-section-title full-width">
                    Decision Information
                  </div>

                  {selectedRequest.decidedByStaffName && (
                    <div className="modal-detail">
                      <span>Decided By</span>
                      <strong>{selectedRequest.decidedByStaffName}</strong>
                    </div>
                  )}

                  {selectedRequest.decidedAt && (
                    <div className="modal-detail">
                      <span>Decided At</span>
                      <strong>{formatDateTime(selectedRequest.decidedAt)}</strong>
                    </div>
                  )}

                  {selectedRequest.decisionRemark && (
                    <div className="modal-detail full-width">
                      <span>Decision Remark</span>
                      <strong>{selectedRequest.decisionRemark}</strong>
                    </div>
                  )}
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
