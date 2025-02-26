/**
 * API service for making requests to the WP Schedule Manager REST API
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
 * Organization API methods
 */
export const organizationApi = {
  /**
   * Get all organizations
   * 
   * @param {Object} options - Options for the request
   * @param {boolean} options.hierarchical - Whether to return organizations in a hierarchical structure
   * @param {number} options.parent_id - Filter organizations by parent ID
   * @returns {Promise} - The fetch promise
   */
  getAll: (options = {}) => {
    let endpoint = '/organizations';
    const params = new URLSearchParams();
    
    if (options.hierarchical) {
      params.append('hierarchical', 'true');
    }
    
    if (options.parent_id !== undefined) {
      params.append('parent_id', options.parent_id);
    }
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return apiRequest(endpoint);
  },

  /**
   * Get a single organization
   * 
   * @param {number} id - The organization ID
   * @param {Object} options - Options for the request
   * @param {boolean} options.include_hierarchy - Whether to include hierarchy information
   * @returns {Promise} - The fetch promise
   */
  getById: (id, options = {}) => {
    let endpoint = `/organizations/${id}`;
    const params = new URLSearchParams();
    
    if (options.include_hierarchy) {
      params.append('include_hierarchy', 'true');
    }
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return apiRequest(endpoint);
  },

  /**
   * Create a new organization
   * 
   * @param {Object} data - The organization data
   * @returns {Promise} - The fetch promise
   */
  create: (data) => apiRequest('/organizations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * Update an organization
   * 
   * @param {number} id - The organization ID
   * @param {Object} data - The organization data
   * @returns {Promise} - The fetch promise
   */
  update: (id, data) => apiRequest(`/organizations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  /**
   * Delete an organization
   * 
   * @param {number} id - The organization ID
   * @returns {Promise} - The fetch promise
   */
  delete: (id) => apiRequest(`/organizations/${id}`, {
    method: 'DELETE'
  })
};

/**
 * Shift API methods
 */
export const shiftApi = {
  /**
   * Get all shifts
   * 
   * @param {Object} params - Query parameters
   * @returns {Promise} - The fetch promise
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/shifts${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single shift
   * 
   * @param {number} id - The shift ID
   * @returns {Promise} - The fetch promise
   */
  getById: (id) => apiRequest(`/shifts/${id}`),

  /**
   * Create a new shift
   * 
   * @param {Object} data - The shift data
   * @returns {Promise} - The fetch promise
   */
  create: (data) => apiRequest('/shifts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  /**
   * Update a shift
   * 
   * @param {number} id - The shift ID
   * @param {Object} data - The shift data
   * @returns {Promise} - The fetch promise
   */
  update: (id, data) => apiRequest(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  /**
   * Delete a shift
   * 
   * @param {number} id - The shift ID
   * @returns {Promise} - The fetch promise
   */
  delete: (id) => apiRequest(`/shifts/${id}`, {
    method: 'DELETE'
  })
};

export default {
  organization: organizationApi,
  shift: shiftApi
};
