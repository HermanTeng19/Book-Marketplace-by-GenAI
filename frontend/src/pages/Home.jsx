import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, checkApiStatus } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import BookGrid from '../components/BookGrid';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ online: true });
  const { showError } = useNotification();

  useEffect(() => {
    const checkApi = async () => {
      const status = await checkApiStatus();
      setApiStatus(status);
      return status.online;
    };
    
    const fetchFeaturedBooks = async () => {
      try {
        // First check if API is online
        const isOnline = await checkApi();
        if (!isOnline) {
          setError('The book service is currently unavailable. Please try again later.');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        // Fetch only available books, limited to 6 for the homepage
        const response = await bookService.getAllBooks({ 
          status: 'available',
          limit: 6,
          page: 1
        });
        
        // Log the full response to debug the structure
        console.log('API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && Array.isArray(response.books)) {
          setFeaturedBooks(response.books);
        } else {
          console.error('Book response format unexpected:', response);
          setError('Failed to fetch featured books');
          setFeaturedBooks([]);
        }
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError('An error occurred while fetching books');
        setFeaturedBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Book Marketplace</h1>
        <p className="text-xl text-gray-600 mb-8">Discover, buy, and sell books with ease</p>
        <Link 
          to="/books"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Browse All Books
        </Link>
      </div>
      
      <div className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Books</h2>
          <Link to="/books" className="text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        
        <BookGrid 
          books={featuredBooks}
          isLoading={loading}
          error={error ? { message: error } : null}
          emptyMessage="No featured books available at the moment."
          addBookLink="/upload"
          showSeller={true}
        />
      </div>
      
      <div className="mt-20 py-10 bg-gray-50 rounded-lg px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Why Choose Book Marketplace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-blue-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3">Wide Selection</h3>
              <p className="text-gray-600">Browse through thousands of books across various genres and categories.</p>
            </div>
            <div className="p-6">
              <div className="text-blue-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
              <p className="text-gray-600">Find the best deals on books or sell your own at competitive prices.</p>
            </div>
            <div className="p-6">
              <div className="text-blue-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
              <p className="text-gray-600">Buy and sell with confidence using our secure payment system.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer section */}
      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Book Marketplace. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for book lovers everywhere</p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-600">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-gray-600">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-gray-600">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 