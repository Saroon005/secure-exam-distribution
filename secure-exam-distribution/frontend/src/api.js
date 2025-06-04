import axios from 'axios';

// Base URL for the Flask backend
const BASE_URL = 'https://secure-exam-distribution.onrender.com/api';

// Configure axios defaults
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data?.error || `Server error: ${status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

export const apiService = {
  // Health check endpoint
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file with encryption
  uploadFile: async (formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Add progress tracking if callback provided
      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        };
      }

      const response = await api.post('/upload', formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get list of all files
  getFiles: async () => {
    try {
      const response = await api.get('/files');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download and decrypt file
  downloadFile: async (fileId, password) => {
    try {
      const response = await api.post(`/download/${fileId}`, 
        { password },
        {
          responseType: 'blob', // Important for file downloads
          timeout: 60000, // Longer timeout for file downloads
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify password without downloading
  verifyFile: async (fileId, password) => {
    try {
      const response = await api.post(`/verify/${fileId}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete encrypted file
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/delete/${fileId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Utility functions for file handling
export const fileUtils = {
  // Download blob as file
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (filename) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  },

  // Validate file size (50MB max)
  validateFileSize: (size) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return size <= maxSize;
  },
};

export default api;