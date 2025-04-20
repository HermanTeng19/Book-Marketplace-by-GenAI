// Frontend configuration

// API endpoints
export const API_URL = 'http://localhost:8000/api';

// Stripe configuration (test mode)
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RDv4URou0SIeyRQWAJ5S2Cw3wIdBZlvUdFbB1QYt10Gdt0H8c1iIOZMQYhCpUuNGw1aNcxVxkytWdvn65ByNyMFu';

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf']; 

// Default pagination
export const DEFAULT_PAGE_SIZE = 10; 