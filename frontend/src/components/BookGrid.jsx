import React from 'react';
import PropTypes from 'prop-types';
import BookCard from './BookCard';
import { Link } from 'react-router-dom';

/**
 * BookGrid component for displaying a grid of books with loading, error and empty states
 * 
 * @param {Object} props
 * @param {Array} props.books - Array of book objects to display
 * @param {boolean} props.isLoading - Whether the books are currently loading
 * @param {string} props.error - Error message to display if there's an error
 * @param {string} props.emptyMessage - Message to display when no books are found
 * @param {boolean} props.showSeller - Whether to show the seller information
 * @param {string} props.addBookLink - Link to add a new book
 */
const BookGrid = ({ 
  books, 
  isLoading = false, 
  error = null, 
  emptyMessage = "No books found", 
  showSeller = true,
  addBookLink = null
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p className="font-medium">Error loading books</p>
          <p className="text-sm mt-1">{error.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!books || books.length === 0) {
    return (
      <div className="w-full p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">{emptyMessage}</p>
          {addBookLink && (
            <Link 
              to={addBookLink} 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Add a Book
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Books grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard key={book._id} book={book} showSeller={showSeller} />
      ))}
    </div>
  );
};

BookGrid.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      status: PropTypes.string
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  emptyMessage: PropTypes.string,
  showSeller: PropTypes.bool,
  addBookLink: PropTypes.string
};

export default BookGrid; 