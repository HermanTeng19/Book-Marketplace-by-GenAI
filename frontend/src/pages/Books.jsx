import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import BookGrid from '../components/BookGrid';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  const { showError } = useNotification();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks(filters);
      
      // Log the full response to debug the structure
      console.log('Books API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.books) {
        setBooks(response.books);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0
        });
      } else if (response.success && response.data) {
        // Alternative data structure
        setBooks(response.data);
        setPagination({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0
        });
      } else if (response.data && Array.isArray(response.data.books)) {
        // Another possible structure
        setBooks(response.data.books);
        const paginationData = response.data.pagination || {};
        setPagination({
          currentPage: paginationData.currentPage || 1,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalItems || 0
        });
      } else {
        console.error('Book response format unexpected:', response);
        setError('Failed to fetch books');
        setBooks([]);
        showError('Failed to fetch books');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('An error occurred while fetching books');
      setBooks([]);
      showError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filters.page, filters.limit, filters.category, filters.status]);

  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      page: 1 // Reset to first page when searching
    });
    fetchBooks();
  };

  const handleCategoryChange = (e) => {
    setFilters({
      ...filters,
      category: e.target.value,
      page: 1 // Reset to first page when changing filters
    });
  };

  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
      page: 1 // Reset to first page when changing filters
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page
    });
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === filters.page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(filters.page - 1)}
          disabled={filters.page === 1}
          className={`px-3 py-1 mx-1 rounded ${
            filters.page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(filters.page + 1)}
          disabled={filters.page === pagination.totalPages}
          className={`px-3 py-1 mx-1 rounded ${
            filters.page === pagination.totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      page: 1,
      limit: 10
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Browse Books</h1>
      
      {/* Filters and Search */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, author or description"
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={handleCategoryChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="science">Science</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="biography">Biography</option>
              <option value="children">Children</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Books grid using BookGrid component */}
      <BookGrid 
        books={books}
        loading={loading}
        error={error}
        emptyMessage="No books found matching your criteria."
        actionButton={
          <button 
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear Filters
          </button>
        }
      />
      
      {/* Pagination */}
      {Array.isArray(books) && books.length > 0 && renderPagination()}
      
      {/* Results count */}
      {Array.isArray(books) && books.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {Math.max(1, (filters.page - 1) * filters.limit + 1)} - {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} books
        </div>
      )}
    </div>
  );
};

export default Books; 