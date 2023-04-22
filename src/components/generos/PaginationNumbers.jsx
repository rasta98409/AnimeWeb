import React, { useState, useEffect } from "react";
import "./PaginationNumbers.css";

const PaginationNumbers = React.memo(({ currentPage,
    totalPages,
    onPageChange,
    handlePreviousPage,
    handleNextPage, }) => {
  const [visiblePageNumbers, setVisiblePageNumbers] = useState([]);

  // Actualizar los números de página visibles
  useEffect(() => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    const limit = 5; // Número máximo de páginas visibles
    let start = currentPage - Math.floor(limit / 2);
    let end = currentPage + Math.floor(limit / 2);

    if (start < 1) {
      start = 1;
      end = Math.min(limit, totalPages);
    } else if (end > totalPages) {
      start = Math.max(1, totalPages - limit + 1);
      end = totalPages;
    }

    setVisiblePageNumbers(pageNumbers.slice(start - 1, end));
  }, [currentPage, totalPages]);

  return (
    <div className="pagination-numbers">
      <button
        className="button-one"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      {visiblePageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          className={`page-number ${
            currentPage === pageNumber ? "active" : ""
          }`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      <button
        className="button-two"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  );

});
export default PaginationNumbers