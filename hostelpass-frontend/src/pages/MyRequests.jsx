import { useCallback, useEffect, useState } from "react";
import {
  getMyOutpassRequests,
  cancelOutpassRequest,
} from "../services/outpassService";

import "../styles/MyRequests.css";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelRequestId, setCancelRequestId] = useState(null);

  const pageSize = 20;

  /* ================================
     SEARCH DEBOUNCE
     ================================ */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  /* ================================
     LOAD REQUESTS
     ================================ */

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOutpassRequests(
        currentPage,
        pageSize,
        debouncedSearch,
        status,
      );

      setRequests(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error("Failed to load requests:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load outpass requests.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  /* ================================
     CANCEL REQUEST
     ================================ */

  const handleCancel = async (id) => {
    try {
      await cancelOutpassRequest(id);

      if (requests.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRequests();
      }

      setSelectedRequest(null);
      setCancelRequestId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel outpass request.");
    }
  };

  /* ================================
     DATE FORMAT
     ================================ */

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================================
     STATUS CLASS
     ================================ */

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";

      case "DENIED":
        return "status-denied";

      case "CANCELLED":
        return "status-cancelled";

      case "PENDING":
      default:
        return "status-pending";
    }
  };

  /* ================================
     PAGINATION
     ================================ */

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

  /* ================================
     LOADING
     ================================ */

  if (loading) {
    return (
      <div className="my-requests-page">
        <div className="requests-header">
          <div>
            <p className="requests-label">OUTPASS REQUESTS</p>
            <h1>My Outpass Requests</h1>
            <p>Track the status of your outpass applications.</p>
          </div>
        </div>

        <div className="requests-message">Loading your requests...</div>
      </div>
    );
  }

  /* ================================
     ERROR
     ================================ */

  if (error) {
    return (
      <div className="my-requests-page">
        <div className="requests-header">
          <div>
            <p className="requests-label">OUTPASS REQUESTS</p>
            <h1>My Outpass Requests</h1>
            <p>Track the status of your outpass applications.</p>
          </div>
        </div>

        <div className="requests-error">
          <p>{error}</p>

          <button onClick={loadRequests}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      {/* ================================
          HEADER
          ================================ */}

      <div className="requests-header">
        <div>
          <p className="requests-label">OUTPASS REQUESTS</p>

          <h1>My Outpass Requests</h1>

          <p>Track the status of your outpass applications.</p>
        </div>

        <div className="request-count">
          <strong>{totalElements}</strong>
          <span>All Requests</span>
        </div>
      </div>

      {/* ================================
          SEARCH + FILTER
          ================================ */}

      <div className="request-filters">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by pass code, place, or reason..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setCurrentPage(0);
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="DENIED">Denied</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* ================================
          EMPTY
          ================================ */}

      {requests.length === 0 ? (
        <div className="empty-requests">
          <h2>No Outpass Requests</h2>

          <p>You haven't submitted any outpass requests yet.</p>
        </div>
      ) : (
        /* ================================
           REQUEST LIST
           ================================ */

        <div className="my-request-list">
          {requests.map((request) => (
            <div className="my-request-card" key={request.id}>
              {/* Card Header */}

              <div className="my-request-header">
                <div>
                  <h2>{request.passCode}</h2>

                  <span className="request-number">Request #{request.id}</span>
                </div>

                <span
                  className={`status-badge ${getStatusClass(request.status)}`}
                >
                  {request.status}
                </span>
              </div>

              {/* Main Information */}

              <div className="request-information">
                <div className="info-item">
                  <span>Place of Visit</span>
                  <strong>{request.placeOfVisit}</strong>
                </div>

                <div className="info-item">
                  <span>Purpose</span>
                  <strong>{request.purpose}</strong>
                </div>

                <div className="info-item">
                  <span>Departure</span>
                  <strong>{formatDateTime(request.departureAt)}</strong>
                </div>

                <div className="info-item">
                  <span>Return</span>
                  <strong>{formatDateTime(request.returnAt)}</strong>
                </div>
              </div>

              {/* Actions */}

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

      {/* ================================
          PAGINATION
          ================================ */}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`pagination-button ${
                  currentPage === index ? "active" : ""
                }`}
                onClick={() => handlePageChange(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* ================================
          DETAILS MODAL
          ================================ */}

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}

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

            {/* Status */}

            <div className="modal-status">
              <span
                className={`status-badge ${getStatusClass(
                  selectedRequest.status,
                )}`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {/* Details */}

            <div className="modal-details">
              <div>
                <span>PLACE OF VISIT</span>
                <strong>{selectedRequest.placeOfVisit}</strong>
              </div>

              <div>
                <span>PURPOSE</span>
                <strong>{selectedRequest.purpose}</strong>
              </div>

              <div className="modal-full">
                <span>REASON</span>
                <strong>{selectedRequest.reason || "—"}</strong>
              </div>

              <div>
                <span>DEPARTURE</span>
                <strong>{formatDateTime(selectedRequest.departureAt)}</strong>
              </div>

              <div>
                <span>RETURN</span>
                <strong>{formatDateTime(selectedRequest.returnAt)}</strong>
              </div>

              <div>
                <span>SUBMITTED</span>
                <strong>{formatDateTime(selectedRequest.submittedAt)}</strong>
              </div>

              <div>
                <span>DECIDED BY</span>
                <strong>{selectedRequest.decidedByStaffName || "—"}</strong>
              </div>

              <div className="modal-full">
                <span>DECISION REMARK</span>
                <strong>{selectedRequest.decisionRemark || "—"}</strong>
              </div>
            </div>

            {/* Cancel */}

            {selectedRequest.status === "PENDING" && (
              <button
                className="modal-cancel-button"
                onClick={() => setCancelRequestId(selectedRequest.id)}
              >
                Cancel Request
              </button>
            )}

            {/* Close */}

            <button
              className="student-modal-close-button"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {cancelRequestId && (
        <div
          className="cancel-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setCancelRequestId(null);
            }
          }}
        >
          <div className="cancel-confirmation-modal">
            <div className="cancel-modal-header">
              <div>
                <p className="cancel-modal-label">CANCEL REQUEST</p>
                <h2>Cancel Outpass Request?</h2>
              </div>

              <button
                className="cancel-modal-close"
                onClick={() => setCancelRequestId(null)}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="cancel-modal-body">
              <p>Are you sure you want to cancel this outpass request?</p>

              <p className="cancel-modal-warning">
                This action cannot be undone.
              </p>
            </div>

            <div className="cancel-modal-footer">
              <button
                className="cancel-modal-back"
                onClick={() => setCancelRequestId(null)}
                type="button"
              >
                Keep Request
              </button>

              <button
                className="cancel-modal-confirm"
                onClick={async () => {
                  const id = cancelRequestId;
                  setCancelRequestId(null);
                  await handleCancel(id);
                }}
                type="button"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequests;
