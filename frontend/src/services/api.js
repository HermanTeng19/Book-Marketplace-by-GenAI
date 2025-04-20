import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a timeout to prevent long waits for unavailable services
  timeout: 10000
});

// Helper function to handle API errors consistently
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API error:', error);
  
  // Special handling for network errors
  if (error.message === 'Network Error') {
    return { 
      success: false, 
      error: error.message,
      isNetworkError: true,
      message: 'Cannot connect to server. Please check your internet connection or try again later.'
    };
  }
  
  // Special handling for timeout errors
  if (error.code === 'ECONNABORTED') {
    return {
      success: false,
      error: 'Request timeout',
      isTimeoutError: true,
      message: 'The server is taking too long to respond. Please try again later.'
    };
  }
  
  return { 
    success: false, 
    error: error.response?.data?.error || error.message || defaultMessage
  };
};

// Helper function to normalize response data
const normalizeBookResponse = (response) => {
  // If response already has a success flag and books array, return it as is
  if (response.success === true && Array.isArray(response.books)) {
    return response;
  }
  
  // If response has data property with books array
  if (response.data && Array.isArray(response.data.books)) {
    return {
      success: true,
      books: response.data.books,
      pagination: response.data.pagination || {}
    };
  }
  
  // If response has data property that is an array
  if (response.data && Array.isArray(response.data)) {
    return {
      success: true,
      books: response.data,
      pagination: response.pagination || {}
    };
  }
  
  // If the response itself is an array of books
  if (Array.isArray(response)) {
    return {
      success: true,
      books: response,
      pagination: { currentPage: 1, totalPages: 1, totalItems: response.length }
    };
  }
  
  // If response has a single book
  if (response.book) {
    return {
      success: true,
      book: response.book
    };
  }
  
  // If response is a single book object (with required book properties)
  if (response._id && response.title) {
    return {
      success: true,
      book: response
    };
  }
  
  // Default case - return original with a success flag
  return {
    ...response,
    success: response.success !== false
  };
};

// Add interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log all errors for debugging
    console.error('API error intercepted:', error);
    
    // Add additional context to network errors
    if (error.message === 'Network Error') {
      console.log('Network error detected - server may be down');
      error.isServerDown = true;
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  }
};

// Book services
export const bookService = {
  getAllBooks: async (params) => {
    try {
      // Prepare the query parameters
      const queryParams = { ...params };
      
      // If excludeId is provided, handle it correctly
      // (the backend may expect a different parameter name or format)
      if (queryParams.excludeId) {
        queryParams.exclude = queryParams.excludeId;
        delete queryParams.excludeId; // Remove the original parameter
      }
      
      const response = await api.get('/books', { params: queryParams });
      
      // Log the raw response for debugging
      console.log('Raw book API response:', response);
      
      if (response.status === 200) {
        return normalizeBookResponse(response.data);
      } else {
        console.error('Unexpected status code:', response.status);
        return { success: false, error: 'Failed to fetch books' };
      }
    } catch (error) {
      console.error('Error in getAllBooks service:', error);
      return handleApiError(error);
    }
  },
  
  getUserBooks: async () => {
    try {
      // Use the user's selling books endpoint
      console.log('Fetching user selling books');
      const response = await api.get('/users/selling-books');
      
      // Log the raw response for debugging
      console.log('Raw user books API response:', response);
      
      if (response.status === 200) {
        return normalizeBookResponse(response.data);
      } else {
        console.error('Unexpected status code:', response.status);
        return handleApiError(null, 'Failed to fetch your books');
      }
    } catch (error) {
      console.error('Error in getUserBooks service:', error);
      return handleApiError(error, 'An error occurred while fetching your books');
    }
  },
  
  getPurchasedBooks: async () => {
    try {
      console.log('Fetching user purchased books');
      const response = await api.get('/users/purchased-books');
      
      // Log the raw response for debugging
      console.log('Raw purchased books API response:', response);
      
      if (response.status === 200) {
        return normalizeBookResponse(response.data);
      } else {
        console.error('Unexpected status code:', response.status);
        return handleApiError(null, 'Failed to fetch purchased books');
      }
    } catch (error) {
      console.error('Error in getPurchasedBooks service:', error);
      return handleApiError(error, 'An error occurred while fetching purchased books');
    }
  },
  
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      
      // Log the raw response for debugging
      console.log('Raw book details API response:', response);
      
      if (response.status === 200) {
        return normalizeBookResponse(response.data);
      } else {
        console.error('Unexpected status code:', response.status);
        return handleApiError(null, 'Failed to fetch book details');
      }
    } catch (error) {
      console.error('Error in getBookById service:', error);
      return handleApiError(error, 'An error occurred while fetching the book details');
    }
  },
  
  uploadBook: async (bookData) => {
    try {
      // Create form data for file uploads
      const formData = new FormData();
      
      // Append all the text fields
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('description', bookData.description);
      formData.append('price', bookData.price);
      formData.append('category', bookData.category);
      
      // Append tags as JSON string if provided
      if (bookData.tags && bookData.tags.length) {
        formData.append('tags', JSON.stringify(bookData.tags));
      }
      
      // Append files
      if (bookData.coverImage) {
        formData.append('coverImage', bookData.coverImage);
      }
      
      if (bookData.pdfFile) {
        formData.append('pdfFile', bookData.pdfFile);
      }
      
      // Log the form data for debugging
      console.log('Uploading book with form data:', 
        Array.from(formData.entries()).map(entry => `${entry[0]}: ${entry[1]}`));
      
      const response = await api.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        return {
          success: true,
          book: response.data.data
        };
      } else {
        console.error('Unexpected status code:', response.status);
        return handleApiError(null, 'Failed to upload book');
      }
    } catch (error) {
      console.error('Error in uploadBook service:', error);
      return handleApiError(error, 'An error occurred while uploading the book');
    }
  },
  
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error in updateBook service:', error);
      return handleApiError(error, 'An error occurred while updating the book');
    }
  },
  
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteBook service:', error);
      return handleApiError(error, 'An error occurred while deleting the book');
    }
  }
};

// User services
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.status === 200) {
        return {
          success: true,
          user: response.data.user || response.data
        };
      } else {
        return handleApiError(null, 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error in getProfile service:', error);
      return handleApiError(error, 'An error occurred while fetching the profile');
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      if (response.status === 200) {
        return {
          success: true,
          user: response.data.user || response.data
        };
      } else {
        return handleApiError(null, 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error in updateProfile service:', error);
      return handleApiError(error, 'An error occurred while updating the profile');
    }
  },
  
  getSellingBooks: async () => {
    try {
      const response = await api.get('/users/selling-books');
      console.log('Raw selling books API response:', response);
      
      if (response.status === 200) {
        return normalizeBookResponse(response.data);
      } else {
        return handleApiError(null, 'Failed to fetch selling books');
      }
    } catch (error) {
      console.error('Error in getSellingBooks service:', error);
      return handleApiError(error, 'An error occurred while fetching selling books');
    }
  },
  
  async getTransactions() {
    try {
      const response = await api.get('/transactions');
      
      if (response.data && response.data.success) {
        return {
          success: true,
          transactions: response.data.data,
          pagination: response.data.pagination
        };
      } else {
        console.error('Failed to fetch transactions:', response.data);
        return handleApiError(null, 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return handleApiError(error, 'An error occurred while fetching transactions');
    }
  },

  async getTransactionById(id) {
    try {
      const response = await api.get(`/transactions/${id}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          transaction: response.data.data
        };
      } else {
        console.error('Failed to fetch transaction:', response.data);
        return handleApiError(null, 'Failed to fetch transaction details');
      }
    } catch (error) {
      return handleApiError(error, 'An error occurred while fetching transaction details');
    }
  }
};

// Transaction services
export const transactionService = {
  createPaymentIntent: async (bookId) => {
    const response = await api.post('/transactions/create-payment-intent', { bookId });
    return response.data;
  },
  
  confirmPayment: async (paymentIntentId) => {
    const response = await api.post('/transactions/confirm-payment', { paymentIntentId });
    return response.data;
  },
  
  notifyPaymentFailed: async (paymentIntentId, errorMessage) => {
    const response = await api.post('/transactions/payment-failed', { 
      paymentIntentId, 
      errorMessage 
    });
    return response.data;
  },
  
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }
};

// Utility to check API status
export const checkApiStatus = async () => {
  try {
    const response = await api.get('/books', { 
      params: { limit: 1 },
      timeout: 5000 // Shorter timeout for status check
    });
    return { 
      online: true, 
      status: response.status,
      message: 'API is online and responding' 
    };
  } catch (error) {
    console.error('API status check failed:', error);
    const isNetworkError = error.message === 'Network Error';
    return { 
      online: false, 
      error: error.message,
      isNetworkError,
      message: isNetworkError 
        ? 'Cannot connect to server. Please check your internet connection.'
        : 'API is offline or not responding correctly.'
    };
  }
};

// Wait for server to come online with retries
export const waitForServer = async (maxRetries = 3, retryInterval = 3000) => {
  let retries = 0;
  while (retries < maxRetries) {
    const status = await checkApiStatus();
    if (status.online) {
      return { success: true, message: 'Server is online' };
    }
    
    console.log(`Server connection attempt ${retries + 1}/${maxRetries} failed, retrying in ${retryInterval/1000}s...`);
    // Wait for the specified interval
    await new Promise(resolve => setTimeout(resolve, retryInterval));
    retries++;
  }
  
  return { 
    success: false, 
    message: 'Server is not available after multiple attempts' 
  };
};

export default api; 