/**
 * API service for making requests to the WP Schedule Manager REST API
 */

// Get the API URL and nonce from the global WordPress variable
const API_URL = window.wpScheduleManager?.apiUrl || '/wp-json/wp-schedule-manager/v1';
const NONCE = window.wpScheduleManager?.nonce || '';

// Role verification helper
const verifyRole = (requiredRole, currentRole) => {
  const roleHierarchy = ['bas', 'schemaläggare', 'admin'];
  const currentIndex = roleHierarchy.indexOf(currentRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  return currentIndex >= requiredIndex;
};

// Permission check helper
const checkPermission = (permission, userCapabilities) => {
  // First, check if user is WordPress admin (has isAdmin flag)
  if (userCapabilities && userCapabilities.isAdmin) {
    return true;
  }

  if (!userCapabilities || !userCapabilities.organizations) {
    return false;
  }

  // Check if organizations is an array or an object
  if (Array.isArray(userCapabilities.organizations)) {
    // Handle array format
    return userCapabilities.organizations.some(org => 
      org.permissions && org.permissions[permission] === true
    );
  } else {
    // Handle object format
    return Object.values(userCapabilities.organizations).some(org => 
      org.permissions && org.permissions[permission] === true
    );
  }
};

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
  getAll: async (options = {}) => {
    try {
      const capabilities = await userApi.getUserCapabilities();
      
      // Skip permission check for WordPress admins
      if (!capabilities.isAdmin && !checkPermission('read_organizations', capabilities)) {
        throw new Error('Insufficient permissions to view organizations');
      }
      
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
    } catch (err) {
      console.error('Error in getAll organizations:', err);
      throw err;
    }
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
  create: async (data) => {
    const capabilities = await userApi.getUserCapabilities();
    if (!checkPermission('create_organizations', capabilities)) {
      throw new Error('Insufficient permissions to create organizations');
    }
    return apiRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Update an organization
   * 
   * @param {number} id - The organization ID
   * @param {Object} data - The organization data
   * @returns {Promise} - The fetch promise
   */
  update: (id, data) => {
    return apiRequest(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete an organization
   * 
   * @param {number} id - The organization ID
   * @returns {Promise} - The fetch promise
   */
  delete: (id) => {
    return apiRequest(`/organizations/${id}`, {
      method: 'DELETE'
    });
  }
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
  getById: (id) => {
    return apiRequest(`/shifts/${id}`);
  },

  /**
   * Create a new shift
   * 
   * @param {Object} data - The shift data
   * @returns {Promise} - The fetch promise
   */
  create: (data) => {
    return apiRequest('/shifts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Update a shift
   * 
   * @param {number} id - The shift ID
   * @param {Object} data - The shift data
   * @returns {Promise} - The fetch promise
   */
  update: (id, data) => {
    return apiRequest(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete a shift
   * 
   * @param {number} id - The shift ID
   * @returns {Promise} - The fetch promise
   */
  delete: (id) => {
    return apiRequest(`/shifts/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * User API methods
 */
export const userApi = {
  /**
   * Get all users
   * 
   * @param {Object} params - Query parameters
   * @returns {Promise} - The fetch promise
   */
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get a single user
   * 
   * @param {number} id - The user ID
   * @returns {Promise} - The fetch promise
   */
  getUser: (id) => {
    return apiRequest(`/users/${id}`);
  },

  /**
   * Create a new user
   * 
   * @param {Object} data - The user data
   * @returns {Promise} - The fetch promise
   */
  createUser: async (data) => {
    const capabilities = await userApi.getUserCapabilities();
    if (!checkPermission('create_users', capabilities)) {
      throw new Error('Insufficient permissions to create users');
    }
    // Validate role
    const validRoles = ['bas', 'schemaläggare', 'admin'];
    if (!validRoles.includes(data.role?.toLowerCase())) {
      throw new Error(`Invalid role: ${data.role}. Must be one of: ${validRoles.join(', ')}`);
    }

    console.log('Creating user with data:', data);
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        user_email: data.user_email,
        role: data.role.toLowerCase()
      })
    });
  },

  /**
   * Update a user
   * 
   * @param {number} id - The user ID
   * @param {Object} data - The user data
   * @returns {Promise} - The fetch promise
   */
  updateUser: async (id, data) => {
    // Validate role if provided
    if (data.role) {
      const validRoles = ['bas', 'schemaläggare', 'admin'];
      if (!validRoles.includes(data.role?.toLowerCase())) {
        throw new Error(`Invalid role: ${data.role}. Must be one of: ${validRoles.join(', ')}`);
      }
      data.role = data.role.toLowerCase();
    }

    console.log('Updating user with ID:', id, 'and data:', data);
    
    // Make sure we're sending the ID in the data too
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: id, // Include the ID explicitly
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name,
        user_email: data.user_email,
        role: data.role
      })
    });
  },

  /**
   * Delete a user
   * 
   * @param {number} id - The user ID
   * @returns {Promise} - The fetch promise
   */
  deleteUser: (id) => {
    console.log('Deleting user:', id);
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Role-Verification': 'true'
      }
    });
  },

  /**
   * Get user organizations
   * 
   * @param {number} id - The user ID
   * @returns {Promise} - The fetch promise
   */
  getUserOrganizations: (id) => {
    return apiRequest(`/users/${id}/organizations`);
  },

  /**
   * Add a user to an organization
   * 
   * @param {number} userId - The user ID
   * @param {number} organizationId - The organization ID
   * @param {string} role - The role (bas, schemaläggare, admin)
   * @returns {Promise} - The fetch promise
   */
  addUserToOrganization: (userId, organizationId, role) => {
    return apiRequest('/users-organizations', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        organization_id: organizationId,
        role
      })
    });
  },

  /**
   * Remove a user from an organization
   * 
   * @param {number} userId - The user ID
   * @param {number} organizationId - The organization ID
   * @returns {Promise} - The fetch promise
   */
  removeUserFromOrganization: (userId, organizationId) => {
    return apiRequest(`/users/${userId}/organizations/${organizationId}`, {
      method: 'DELETE'
    });
  },

  /**
   * Update user's role in an organization
   * 
   * @param {number} userId - The user ID
   * @param {number} organizationId - The organization ID
   * @param {string} role - The new role (bas, schemaläggare, admin)
   * @returns {Promise} - The fetch promise
   */
  updateUserOrganizationRole: (userId, organizationId, role) => {
    return apiRequest(`/users/${userId}/organizations/${organizationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  /**
   * Get user capabilities
   * 
   * @returns {Promise} - The fetch promise
   */
  getUserCapabilities: async () => {
    try {
      const response = await fetch(`${API_URL}/capabilities`, {
        headers: {
          'X-WP-Nonce': NONCE
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user capabilities: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user capabilities:', error);
      // Return a default object instead of throwing to prevent breaking the UI
      return {
        isAdmin: false,
        role: 'base',
        organizations: []
      };
    }
  },

  /**
   * Update user role
   * 
   * @param {number} userId - The user ID
   * @param {string} role - The role
   * @returns {Promise} - The fetch promise
   */
  updateUserRole: async (userId, role) => {
    const capabilities = await userApi.getUserCapabilities();
    if (!checkPermission('manage_roles', capabilities)) {
      throw new Error('Insufficient permissions to manage roles');
    }
    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });
      return response.json();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
};

export default {
  organization: organizationApi,
  shift: shiftApi,
  user: userApi
};
