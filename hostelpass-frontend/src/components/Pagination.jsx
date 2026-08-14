import "../styles/pagination.css";

/**
 * Pagination — Shared pagination controls.
 * Props: currentPage (0-indexed), totalPages, onPageChange(pageIndex)
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

  // Build page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = maxVisible - 2;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - maxVisible + 1;
        end = totalPages - 2;
      }

      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="hp-pagination">
      <button
        className="hp-pagination-btn"
        onClick={handlePrev}
        disabled={currentPage === 0}
      >
        ← Prev
      </button>

      <div className="hp-pagination-pages">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="hp-pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`hp-pagination-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </button>
          ),
        )}
      </div>

      <button
        className="hp-pagination-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
