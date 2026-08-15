import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getOutpassRequests,
  approveOutpassRequest,
  denyOutpassRequest,
} from "../services/outpassService";

import "../styles/StaffRequests.css";
import Pagination from "../components/Pagination";

function StaffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [searchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Smaller page size makes pagination visible and keeps the page compact.
  const pageSize = 6;

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOutpassRequests(
        currentPage,
        pageSize,
        search,
        status,
      );

      setRequests(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error(error);
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

    if (Number.isNaN(date.getTime())) {
      return value;
    }

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

  const handleApprove = async (id) => {
    try {
      await approveOutpassRequest(id, "Approved by staff");

      if (requests.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRequests();
      }

      setSelectedRequest(null);
    } catch (error) {
      console.error(error);
      alert("Failed to approve outpass request.");
    }
  };

  const handleDeny = async (id) => {
    const remark = window.prompt("Enter reason for denial:");

    if (!remark || remark.trim().length < 5) {
      alert("Denial reason must be at least 5 characters.");
      return;
    }

    try {
      await denyOutpassRequest(id, remark);

      if (requests.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRequests();
      }

      setSelectedRequest(null);
    } catch (error) {
      console.error(error);
      alert("Failed to deny outpass request.");
    }
  };

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(0);
  };

  return (
    <div className="staff-requests-page">
      {/* ================= HEADER ================= */}
      <div className="staff-requests-header">
        <div className="staff-requests-heading">
          <p className="page-label">OUTPASS MANAGEMENT</p>

          <h1>Outpass Requests</h1>

          <p className="page-description">
            Review and manage student outpass requests.
          </p>
        </div>

        <div className="request-count">
          <strong>{totalElements}</strong>
          <span>{status ? `${status} Requests` : "All Requests"}</span>
        </div>
      </div>

      {/* ================= SEARCH / FILTER ================= */}
      <div className="request-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

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
              }}
              type="button"
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
              ? "Try changing your search or status filter."
              : "There are currently no outpass requests."}
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
              {Math.min(
                currentPage * pageSize + requests.length,
                totalElements,
              )}
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

                    <span className="request-number">
                      Request #{request.id}
                    </span>
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

                {/* CARD FOOTER */}
                <div className="request-card-footer">
                  <button
                    className="view-details-button"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </button>

                  {request.status === "PENDING" && (
                    <div className="request-actions">
                      <button
                        className="approve-button"
                        onClick={() => handleApprove(request.id)}
                      >
                        ✓ Approve
                      </button>

                      <button
                        className="deny-button"
                        onClick={() => handleDeny(request.id)}
                      >
                        ✕ Deny
                      </button>
                    </div>
                  )}
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

      {/* ================= DETAILS MODAL ================= */}
      {selectedRequest && (
        <div
          className="request-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="request-modal">
            {/* MODAL HEADER */}
            <div className="request-modal-header">
              <div>
                <p className="modal-label">OUTPASS REQUEST</p>

                <h2>{selectedRequest.passCode}</h2>

                <span>Request #{selectedRequest.id}</span>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedRequest(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL STATUS */}
            <div className="modal-status-row">
              <span>Status</span>

              <span className={getStatusClass(selectedRequest.status)}>
                {selectedRequest.status}
              </span>
            </div>

            {/* MODAL DETAILS */}
            <div className="request-modal-details">
              <div className="modal-detail">
                <span>Student</span>
                <strong>{selectedRequest.studentName}</strong>
              </div>

              <div className="modal-detail">
                <span>Roll Number</span>
                <strong>{selectedRequest.rollNumber}</strong>
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
                <span>Departure</span>
                <strong>{formatDateTime(selectedRequest.departureAt)}</strong>
              </div>

              <div className="modal-detail">
                <span>Return</span>
                <strong>{formatDateTime(selectedRequest.returnAt)}</strong>
              </div>

              <div className="modal-detail">
                <span>Submitted</span>
                <strong>{formatDateTime(selectedRequest.submittedAt)}</strong>
              </div>

              {selectedRequest.decidedByStaffName && (
                <div className="modal-detail">
                  <span>Decided By</span>
                  <strong>{selectedRequest.decidedByStaffName}</strong>
                </div>
              )}

              {selectedRequest.decisionRemark && (
                <div className="modal-detail full-width">
                  <span>Decision Remark</span>
                  <strong>{selectedRequest.decisionRemark}</strong>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="request-modal-footer">
              {selectedRequest.status === "PENDING" && (
                <div className="modal-action-group">
                  <button
                    className="approve-button"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    ✓ Approve
                  </button>

                  <button
                    className="deny-button"
                    onClick={() => handleDeny(selectedRequest.id)}
                  >
                    ✕ Deny
                  </button>
                </div>
              )}

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

export default StaffRequests;
