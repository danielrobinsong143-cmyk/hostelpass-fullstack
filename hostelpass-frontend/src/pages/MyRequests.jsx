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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");

  const pageSize = 20;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadRequests = useCallback(async () => {
    try {
      //setLoading(true);
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
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this outpass request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await cancelOutpassRequest(id);

      alert("Outpass request cancelled successfully.");

      if (requests.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRequests();
      }
    } catch (error) {
      console.error("Failed to cancel request:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to cancel outpass request.");
      }
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "—";
    }

    return new Date(dateTime).toLocaleString();
  };

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

  // Change page
  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="my-requests-page">
        <h1>My Outpass Requests</h1>

        <div className="requests-message">Loading your requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-requests-page">
        <h1>My Outpass Requests</h1>

        <div className="requests-error">
          <p>{error}</p>

          <button onClick={loadRequests}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <div className="requests-header">
        <div>
          <h1>My Outpass Requests</h1>
          <p>Track the status of your outpass applications.</p>
        </div>

        <div className="request-count">
          {totalElements}
          <span>Requests</span>
        </div>
      </div>

      <div className="request-filters">
        <input
          type="text"
          placeholder="Search by pass code, place, or reason..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(0);
          }}
        />

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

      {requests.length === 0 ? (
        <div className="empty-requests">
          <h2>No Outpass Requests</h2>

          <p>You haven't submitted any outpass requests yet.</p>
        </div>
      ) : (
        <div className="my-request-list">
          {requests.map((request) => (
            <div className="my-request-card" key={request.id}>
              <div className="my-request-header">
                <div>
                  <h2>{request.passCode}</h2>

                  <span
                    className={`status-badge ${getStatusClass(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>

                <span className="request-number">Request #{request.id}</span>
              </div>

              <div className="request-information">
                <div className="info-item">
                  <span>Place of Visit</span>
                  <strong>{request.placeOfVisit}</strong>
                </div>

                <div className="info-item">
                  <span>Purpose</span>
                  <strong>{request.purpose}</strong>
                </div>

                <div className="info-item full">
                  <span>Reason</span>
                  <strong>{request.reason}</strong>
                </div>

                <div className="info-item">
                  <span>Departure</span>
                  <strong>{formatDateTime(request.departureAt)}</strong>
                </div>

                <div className="info-item">
                  <span>Return</span>
                  <strong>{formatDateTime(request.returnAt)}</strong>
                </div>

                <div className="info-item">
                  <span>Submitted</span>
                  <strong>{formatDateTime(request.submittedAt)}</strong>
                </div>
              </div>

              {(request.decidedByStaffName || request.decisionRemark) && (
                <div className="decision-section">
                  <h3>Staff Decision</h3>

                  {request.decidedByStaffName && (
                    <p>
                      <strong>Decided By:</strong> {request.decidedByStaffName}
                    </p>
                  )}

                  {request.decisionRemark && (
                    <p>
                      <strong>Remark:</strong> {request.decisionRemark}
                    </p>
                  )}
                </div>
              )}

              {request.status === "PENDING" && (
                <div className="request-footer">
                  <button
                    className="cancel-button"
                    onClick={() => handleCancel(request.id)}
                  >
                    Cancel Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
}

export default MyRequests;
