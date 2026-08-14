/**
 * EmptyState — Displays a centered message when a list has no items.
 */
function EmptyState({ title = "No data", message = "", children }) {
  return (
    <div className="hp-card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <h3 style={{ marginBottom: "8px", fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)" }}>
        {title}
      </h3>
      {message && (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          {message}
        </p>
      )}
      {children && <div style={{ marginTop: "16px" }}>{children}</div>}
    </div>
  );
}

export default EmptyState;
