import { useCallback, useEffect, useState } from "react";
import {
  getOutpassRequests,
  approveOutpassRequest,
  denyOutpassRequest,
} from "../services/outpassService";

import "../styles/StaffRequests.css";

function StaffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const pageSize = 20;

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
      setError("Failed to load pending outpass requests.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const handleApprove = async (id) => {
    try {
      await approveOutpassRequest(id, "Approved by staff");

      if (requests.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadRequests();
      }
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
  };

  return (
    <div className="staff-requests-page">
      <div className="staff-requests-header">
        <div>
          <h1>Outpass Requests</h1>
          <p>Review and manage pending student outpass requests.</p>
          <div className="staff-request-search">
            <input
              type="text"
              placeholder="Search by student name, roll number, pass code, or place..."
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
        </div>

        <div className="request-count">
          {totalElements}
          <span>{status ? status : "All"} Requests</span>
        </div>
      </div>

      {loading && (
        <div className="request-message">
          <p>Loading requests...</p>
        </div>
      )}

      {error && (
        <div className="request-message error">
          <p>{error}</p>
          <button onClick={loadRequests}>Try Again</button>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="request-message">
          <h2>No Pending Requests</h2>
          <p>There are currently no outpass requests waiting for approval.</p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="staff-request-list">
          {requests.map((request) => (
            <div className="staff-request-card" key={request.id}>
              <div className="request-card-header">
                <div>
                  <h2>{request.passCode}</h2>
                  <span>Request #{request.id}</span>
                </div>

                <span className="pending-badge">{request.status}</span>
              </div>

              <div className="request-details">
                <div className="request-detail">
                  <span>Student</span>
                  <strong>{request.studentName}</strong>
                </div>

                <div className="request-detail">
                  <span>Roll Number</span>
                  <strong>{request.rollNumber}</strong>
                </div>

                <div className="request-detail">
                  <span>Place of Visit</span>
                  <strong>{request.placeOfVisit}</strong>
                </div>

                <div className="request-detail">
                  <span>Purpose</span>
                  <strong>{request.purpose}</strong>
                </div>

                <div className="request-detail full-width">
                  <span>Reason</span>
                  <strong>{request.reason}</strong>
                </div>

                <div className="request-detail">
                  <span>Departure</span>
                  <strong>{request.departureAt}</strong>
                </div>

                <div className="request-detail">
                  <span>Return</span>
                  <strong>{request.returnAt}</strong>
                </div>
              </div>

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
                    Approve
                  </button>

                  <button
                    className="deny-button"
                    onClick={() => handleDeny(request.id)}
                  >
                    Deny
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
      {selectedRequest && (
        <div className="request-modal-overlay">
          <div className="request-modal">
            <div className="request-modal-header">
              <div>
                <h2>{selectedRequest.passCode}</h2>
                <span>Request #{selectedRequest.id}</span>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>

            <div className="request-modal-details">
              <div className="request-detail">
                <span>Student</span>
                <strong>{selectedRequest.studentName}</strong>
              </div>

              <div className="request-detail">
                <span>Roll Number</span>
                <strong>{selectedRequest.rollNumber}</strong>
              </div>

              <div className="request-detail">
                <span>Status</span>
                <strong>{selectedRequest.status}</strong>
              </div>

              <div className="request-detail">
                <span>Place of Visit</span>
                <strong>{selectedRequest.placeOfVisit}</strong>
              </div>

              <div className="request-detail">
                <span>Purpose</span>
                <strong>{selectedRequest.purpose}</strong>
              </div>

              <div className="request-detail full-width">
                <span>Reason</span>
                <strong>{selectedRequest.reason}</strong>
              </div>

              <div className="request-detail">
                <span>Departure</span>
                <strong>{selectedRequest.departureAt}</strong>
              </div>

              <div className="request-detail">
                <span>Return</span>
                <strong>{selectedRequest.returnAt}</strong>
              </div>

              <div className="request-detail">
                <span>Submitted</span>
                <strong>{selectedRequest.submittedAt || "—"}</strong>
              </div>

              {selectedRequest.decidedByStaffName && (
                <div className="request-detail">
                  <span>Decided By</span>
                  <strong>{selectedRequest.decidedByStaffName}</strong>
                </div>
              )}

              {selectedRequest.decisionRemark && (
                <div className="request-detail full-width">
                  <span>Decision Remark</span>
                  <strong>{selectedRequest.decisionRemark}</strong>
                </div>
              )}
            </div>

            <div className="request-modal-footer">
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
