import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BookGrid from '../components/BookGrid';
import PaymentModal from '../components/PaymentModal';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isServerDown, setIsServerDown] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchaseStatus, setCheckingPurchaseStatus] = useState(false);
  const [bookUnavailable, setBookUnavailable] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBookById(id);
        
        // Log the response for debugging
        console.log('Book details response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.book) {
          setBook(response.book);
          setIsServerDown(false);
          setBookUnavailable(false);
          fetchRelatedBooks(response.book.category);
          if (user && response.book.status === 'sold') {
            checkIfUserPurchasedBook(response.book._id);
          }
        } else if (response.success && response.data) {
          // Alternative structure
          setBook(response.data);
          setIsServerDown(false);
          setBookUnavailable(false);
          fetchRelatedBooks(response.data.category);
          if (user && response.data.status === 'sold') {
            checkIfUserPurchasedBook(response.data._id);
          }
        } else {
          console.error('Unexpected book details response:', response);
          
          // Check for specific error messages about book unavailability
          if (response.error && (
              response.error.includes('no longer available') || 
              response.error.includes('not available') ||
              response.error.includes('book not found')
            )) {
            setBookUnavailable(true);
            setError(response.error);
            // Don't show the error notification for unavailable books
          } else {
            setError('Failed to load book details');
            showError('Could not load book details');
          }
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        
        // Check if the error is a connection error
        if (err.message === 'Network Error') {
          setIsServerDown(true);
          setError('Cannot connect to server. Retrying...');
          // Auto-retry after 3 seconds, up to 3 times
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 3000);
          } else {
            setError('Server connection failed. Please try again later.');
            showError('Server connection failed');
          }
        } else if (err.response && err.response.status === 403) {
          // Handle 403 Forbidden - Book might be sold or not available
          setBookUnavailable(true);
          setError('This book is no longer available');
          // Don't show error notification for 403 responses from sold books
        } else {
          setError('An error occurred while loading the book');
          showError('Failed to load book details');
        }
      } finally {
        setLoading(false);
      }
    };

    const checkIfUserPurchasedBook = async (bookId) => {
      if (!user) return;
      
      try {
        setCheckingPurchaseStatus(true);
        console.log('Checking if user purchased book:', bookId);
        const response = await userService.getPurchasedBooks();
        
        if (response.success && response.books) {
          // Check if this book is in user's purchased books
          const isPurchased = response.books.some(book => book._id === bookId);
          setHasPurchased(isPurchased);
          console.log('User has purchased this book:', isPurchased);
        }
      } catch (err) {
        console.error('Error checking purchase status:', err);
      } finally {
        setCheckingPurchaseStatus(false);
      }
    };

    const fetchRelatedBooks = async (category) => {
      if (!category) return;
      
      try {
        setLoadingRelated(true);
        // Fetch books with the same category, limit to 4, exclude current book
        const response = await bookService.getAllBooks({
          category,
          limit: 4,
          status: 'available',
          excludeId: id
        });
        
        if (response.success && response.books) {
          setRelatedBooks(response.books);
        } else if (response.success && response.data) {
          setRelatedBooks(response.data);
        } else {
          console.error('Failed to fetch related books');
          setRelatedBooks([]);
        }
      } catch (error) {
        console.error('Error fetching related books:', error);
        setRelatedBooks([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id, showError, retryCount, user]);

  const handlePurchase = () => {
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError('Retrying connection...');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">{isServerDown ? 'Connecting to server...' : 'Loading book details...'}</p>
      </div>
    );
  }

  // Special case for unavailable books (sold or deleted)
  if (bookUnavailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Book Unavailable</h2>
          <p>{error || 'This book is no longer available for viewing or purchase.'}</p>
        </div>
        <div className="mt-4">
          <Link to="/books" className="text-blue-600 hover:text-blue-800 mr-4">
            ← Browse Available Books
          </Link>
          {user && (
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error || 'Book not found'}</p>
          {isServerDown && (
            <button 
              onClick={handleRetry} 
              className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded"
            >
              Retry Connection
            </button>
          )}
        </div>
        <Link to="/books" className="text-blue-600 hover:text-blue-800">
          ← Back to Books
        </Link>
      </div>
    );
  }

  // Check if the user is the seller of this book
  const isSellerOfBook = user && book.seller && user.id === book.seller._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/books" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to Books
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <div>
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                console.log("Cover image failed to load:", e.target.src);
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/images/no-cover.png';
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">By {book.author}</p>
          <p className="text-2xl font-bold mb-6">${typeof book.price === 'number' ? book.price.toFixed(2) : '0.00'}</p>
          
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              book.status === 'available' 
                ? 'bg-green-500 text-white' 
                : book.status === 'sold' 
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-500 text-white'
            }`}>
              {book.status || 'Unknown'}
            </span>
            {book.category && (
              <span className="inline-block ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {book.category}
              </span>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{book.description || 'No description available'}</p>
          </div>

          {user && book.status === 'available' && !isSellerOfBook && (
            <button
              onClick={handlePurchase}
              className="w-full py-3 px-4 rounded-md text-white font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Purchase Now
            </button>
          )}

          {isSellerOfBook && (
            <div className="bg-indigo-100 border border-indigo-400 text-indigo-700 px-4 py-3 rounded">
              <p className="font-semibold">You are the seller of this book.</p>
            </div>
          )}

          {user && book.status === 'sold' && hasPurchased && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">You own this book</p>
              <p className="mt-1 text-sm">You've successfully purchased this book. You can access it from your dashboard.</p>
            </div>
          )}

          {user && book.status === 'sold' && !hasPurchased && !isSellerOfBook && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="font-semibold">This book has been sold</p>
              <p className="mt-1 text-sm">This book is no longer available for purchase.</p>
            </div>
          )}

          {!user && (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                Please sign in to purchase this book
              </p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Related Books Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Books</h2>
        <BookGrid 
          books={relatedBooks}
          loading={loadingRelated}
          emptyMessage="No related books found."
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          book={book}
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
        />
      )}
    </div>
  );
};

export default BookDetails; 