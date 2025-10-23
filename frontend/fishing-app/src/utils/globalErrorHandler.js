import { Alert } from 'react-native';

/**
 * Global error handler that can be used throughout the app
 * to catch and handle errors gracefully with user-friendly messages
 */

// Set up global error handling
if (typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global Error:', error);
    
    if (isFatal) {
      Alert.alert(
        'Unexpected Error',
        'The app encountered an unexpected error. Please restart the app.',
        [
          {
            text: 'Restart',
            onPress: () => {
              // In production, you might want to restart or navigate to a safe screen
              console.log('User requested restart');
            },
          },
        ]
      );
    } else {
      // For non-fatal errors, just log them
      console.warn('Non-fatal error occurred:', error);
    }
    
    // Call the default handler
    if (defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - The async function to wrap
 * @param {string} errorMessage - Custom error message to display
 * @returns {Function} - Wrapped function
 */
export const withErrorHandling = (fn, errorMessage = 'An error occurred') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error in wrapped function:', error);
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      return null;
    }
  };
};

/**
 * Handles network errors specifically
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export const handleNetworkError = (error) => {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    if (status === 404) return 'Resource not found';
    if (status === 401) return 'Authentication failed';
    if (status === 403) return 'Access denied';
    if (status === 500) return 'Server error. Please try again later';
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response
    return 'Cannot connect to server. Check your internet connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Safe API call wrapper
 * @param {Function} apiCall - The API call function
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} - Result or null
 */
export const safeApiCall = async (apiCall, errorMessage) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    const message = errorMessage || handleNetworkError(error);
    return { success: false, error: message };
  }
};

export default {
  withErrorHandling,
  handleNetworkError,
  safeApiCall,
};

