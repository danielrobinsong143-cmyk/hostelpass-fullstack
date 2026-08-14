import "../styles/loading-spinner.css";

/**
 * LoadingSpinner — A centered spinner with optional message text.
 */
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" />
      <p className="loading-spinner-text">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
