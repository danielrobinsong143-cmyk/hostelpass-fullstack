import "../styles/modal.css";

/**
 * Modal — Reusable modal dialog with overlay backdrop.
 * Props: open, onClose, title, subtitle, children, footer
 */
function Modal({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;

  return (
    <div className="hp-overlay" onClick={onClose}>
      <div
        className="hp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hp-modal-header">
          <div>
            <h2 className="hp-modal-title">{title}</h2>
            {subtitle && <span className="hp-modal-subtitle">{subtitle}</span>}
          </div>
          <button className="hp-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="hp-modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="hp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
