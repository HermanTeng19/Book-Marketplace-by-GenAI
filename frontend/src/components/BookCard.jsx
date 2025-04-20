import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const BookCard = ({ book, showSeller = true }) => {
  if (!book) return null;
  
  // Check book status
  const isAvailable = book.status === 'available';
  const isSold = book.status === 'sold';

  // Format price with two decimal places
  const formattedPrice = typeof book.price === 'number' 
    ? `$${book.price.toFixed(2)}` 
    : book.price ? `$${book.price}` : 'Price not available';

  // Determine badge color based on status
  const getBadgeClass = () => {
    switch (book.status) {
      case 'available':
        return 'bg-green-500 text-white';
      case 'sold':
        return 'bg-red-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      {/* Status badge in corner */}
      {book.status && (
        <div className={`absolute top-0 right-0 m-2 px-2 py-1 text-xs font-bold rounded ${getBadgeClass()}`}>
          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
        </div>
      )}
      
      <Link to={`/books/${book._id}`} className="block">
        <div className="relative pb-[56.25%] bg-gray-200">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="absolute w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/images/no-cover.png';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500">No Cover</span>
            </div>
          )}
          
          {/* Overlay for sold books */}
          {isSold && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-white text-lg font-bold">SOLD</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate" title={book.title}>
            {book.title}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1 truncate" title={book.author}>
            By {book.author}
          </p>
          
          {book.category && (
            <p className="text-xs text-gray-500 mt-1">
              {book.category}
            </p>
          )}
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-md font-bold text-gray-900">
              {formattedPrice}
            </span>
            
            {/* Action hint */}
            <span className={`text-xs ${isAvailable ? 'text-blue-600' : 'text-gray-500'}`}>
              {isAvailable ? 'View Details →' : 'View Info →'}
            </span>
          </div>
          
          {/* Seller info if applicable */}
          {showSeller && book.seller && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              Seller: {book.seller.name || 'Unknown'}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    coverImage: PropTypes.string,
    status: PropTypes.string,
    category: PropTypes.string,
    seller: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    })
  }).isRequired,
  showSeller: PropTypes.bool
};

export default BookCard; 