/**
 * StatusBadge — Renders a colored pill for outpass status.
 * Uses the design-system .hp-badge-* classes.
 */
function StatusBadge({ status }) {
  const className = `hp-badge hp-badge-${(status || "pending").toLowerCase()}`;
  return <span className={className}>{status}</span>;
}

export default StatusBadge;
