import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOutpassRequest } from "../services/outpassService";
import "../styles/ApplyOutpass.css";

function ApplyOutpass() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    placeOfVisit: "",
    purpose: "",
    reason: "",
    departureAt: "",
    returnAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (formData.reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }

    if (formData.reason.trim().length > 1000) {
      setError("Reason must not exceed 1000 characters.");
      return;
    }

    if (
      formData.departureAt &&
      formData.returnAt &&
      new Date(formData.returnAt) <= new Date(formData.departureAt)
    ) {
      setError("Return date/time must be after departure date/time.");
      return;
    }

    try {
      setLoading(true);

      const response = await createOutpassRequest(formData);

      //console.log("Create Outpass Response:", response.data);

      setSuccess(`Outpass ${response.data.passCode} submitted successfully.`);

      setFormData({
        placeOfVisit: "",
        purpose: "",
        reason: "",
        departureAt: "",
        returnAt: "",
      });
    } catch (error) {
      console.error("Failed to create outpass:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to submit outpass request.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="apply-outpass-page">
      <div className="apply-header">
        <div>
          <h1>Apply for Outpass</h1>
          <p>Submit a request to leave the hostel.</p>
        </div>
      </div>

      {error && (
        <div className="apply-message apply-error">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="apply-message apply-success">
          <strong>✓ Request Submitted</strong>
          <p>{success}</p>

          <button type="button" onClick={() => navigate("/student/requests")}>
            View My Requests
          </button>
        </div>
      )}

      <form className="outpass-form" onSubmit={handleSubmit}>
        {/* Place of Visit */}

        <div className="form-group">
          <label htmlFor="placeOfVisit">Place of Visit</label>

          <input
            id="placeOfVisit"
            type="text"
            name="placeOfVisit"
            value={formData.placeOfVisit}
            onChange={handleChange}
            placeholder="Example: City Hospital"
            minLength={2}
            maxLength={150}
            required
          />
        </div>

        {/* Purpose */}

        <div className="form-group">
          <label htmlFor="purpose">Purpose</label>

          <select
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          >
            <option value="">Select purpose</option>

            <option value="MEDICAL_APPOINTMENT">Medical Appointment</option>

            <option value="FAMILY_EMERGENCY">Family Emergency</option>

            <option value="PERSONAL_WORK">Personal Work</option>

            <option value="EDUCATIONAL_SEMINAR">Educational Seminar</option>

            <option value="RELIGIOUS_FESTIVAL">Religious Festival</option>

            <option value="SHOPPING_ERRANDS">Shopping / Errands</option>

            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Reason */}

        <div className="form-group">
          <label htmlFor="reason">Reason</label>

          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Explain why you need an outpass..."
            minLength={10}
            maxLength={1000}
            rows={5}
            required
          />

          <small>{formData.reason.length}/1000 characters</small>
        </div>

        {/* Date and Time */}

        <div className="date-section">
          <div className="form-group">
            <label htmlFor="departureAt">Departure Date & Time</label>

            <input
              id="departureAt"
              type="datetime-local"
              name="departureAt"
              value={formData.departureAt}
              onChange={handleChange}
              min={getMinDateTime()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="returnAt">Return Date & Time</label>

            <input
              id="returnAt"
              type="datetime-local"
              name="returnAt"
              value={formData.returnAt}
              onChange={handleChange}
              min={formData.departureAt || getMinDateTime()}
              required
            />
          </div>
        </div>

        {/* Submit */}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-outpass-button"
            disabled={loading}
          >
            {loading ? "Submitting Request..." : "Submit Outpass Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ApplyOutpass;
