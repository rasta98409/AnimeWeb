

import React, { useState, useEffect } from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalVideoLinks, onPageChange }) => {
  const totalPages = Math.ceil(totalVideoLinks / 12);
  const [visiblePageNumbers, setVisiblePageNumbers] = useState([]);
  const [showFirst, setShowFirst] = useState(false);
  const [showLast, setShowLast] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  
  useEffect(() => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const limit = windowWidth <= 700 ? 4 : 10; // Número máximo de páginas visibles
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

    setShowFirst(currentPage > 10);
    setShowLast(currentPage < totalPages - 10);
  }, [currentPage, totalPages, windowWidth]);


  const handlePreviousPage = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };

  const handleLastPage = () => {
    onPageChange(currentPage === totalPages ? 1 : totalPages);
  };

  return (
    <div className="pagination">
      <button
        className="button-one"
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      {showFirst && (
        <button
          className="page-number"
          onClick={() => onPageChange(1)}
        >
          1...
        </button>
      )}
      {visiblePageNumbers.map((page) => (
        <button
          key={page}
          className={`page-number ${page === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      {showLast && (
        <button
          className="page-number"
          onClick={() => onPageChange(totalPages)}
        >
          ...{totalPages}
        </button>
      )}
      <button
        className="button-two"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;