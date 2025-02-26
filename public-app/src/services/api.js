/**
 * API service for making requests to the WP Schedule Manager REST API
 * Public-facing version
 */

// Get the API URL and nonce from the global WordPress variable
const API_URL = window.wpScheduleManager?.apiUrl || '/wp-json/wp-schedule-manager/v1';
const NONCE = window.wpScheduleManager?.nonce || '';

/**
 * Make a request to the API
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - The fetch promise
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': NONCE,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * User API methods for public-facing features
 */
export const userApi = {
  /**
   * Get the current user's profile
   * 
   * @returns {Promise} - The fetch promise
   */
  getProfile: () => apiRequest('/users/me'),

  /**
   * Update the current user's profile
   * 
   * @param {Object} data - The profile data to update
   * @returns {Promise} - The fetch promise
   */
  updateProfile: (data) => apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  /**
   * Get the current user's organizations
   * 
   * @returns {Promise} - The fetch promise
   */
  getOrganizations: () => apiRequest('/users/me/organizations'),
};

/**
 * Shift API methods for public-facing features
 */
export const shiftApi = {
  /**
   * Get shifts for the current user
   * 
   * @param {Object} params - Query parameters
   * @returns {Promise} - The fetch promise
   */
  getMyShifts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users/me/shifts${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get available shifts that the user can sign up for
   * 
   * @param {Object} params - Query parameters
   * @returns {Promise} - The fetch promise
   */
  getAvailableShifts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/shifts/available${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Sign up for a shift
   * 
   * @param {number} shiftId - The shift ID
   * @returns {Promise} - The fetch promise
   */
  signUp: (shiftId) => apiRequest(`/shifts/${shiftId}/signup`, {
    method: 'POST'
  }),

  /**
   * Cancel a shift signup
   * 
   * @param {number} shiftId - The shift ID
   * @returns {Promise} - The fetch promise
   */
  cancelSignUp: (shiftId) => apiRequest(`/shifts/${shiftId}/signup`, {
    method: 'DELETE'
  }),
};

/**
 * Availability API methods
 */
export const availabilityApi = {
  /**
   * Get the current user's availability
   * 
   * @returns {Promise} - The fetch promise
   */
  getMyAvailability: () => apiRequest('/users/me/availability'),

  /**
   * Update the current user's availability
   * 
   * @param {Object} data - The availability data
   * @returns {Promise} - The fetch promise
   */
  updateAvailability: (data) => apiRequest('/users/me/availability', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
};

export default {
  user: userApi,
  shift: shiftApi,
  availability: availabilityApi
};
