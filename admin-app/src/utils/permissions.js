/**
 * Utility functions for checking user permissions in the React app
 */

/**
 * Check if the current user can perform a specific action
 * 
 * @param {string} action - The action to check (e.g., 'viewSchedule', 'manageShift', 'manageResources')
 * @param {number|null} organizationId - The organization ID to check permissions for, or null for global permissions
 * @returns {boolean} - Whether the user can perform the action
 */
export function canUserPerformAction(action, organizationId = null) {
    const { userCapabilities } = window.wpScheduleManager || {};
    
    if (!userCapabilities) return false;
    
    // Admin has all permissions
    if (userCapabilities.isAdmin || userCapabilities.role === 'admin') return true;
    
    // Scheduler can manage schedules and shifts
    if (userCapabilities.role === 'schemalaggare' && 
        (action === 'viewSchedule' || action === 'manageShift')) {
        return true;
    }
    
    // Check organization-specific permissions
    if (organizationId && userCapabilities.organizations) {
        const orgCaps = userCapabilities.organizations.find(
            org => org.id === parseInt(organizationId, 10)
        );
        if (orgCaps) {
            return orgCaps[action] === true;
        }
    }
    
    // Base user can only view schedule and manage own shifts
    if (userCapabilities.role === 'bas' && action === 'viewSchedule') {
        return true;
    }
    
    return false;
}

/**
 * Check if the current user has a specific role in any organization
 * 
 * @param {string} role - The role to check for ('admin', 'scheduler', 'base')
 * @returns {boolean} - Whether the user has the role in any organization
 */
export function userHasRoleAnywhere(role) {
    const { userCapabilities } = window.wpScheduleManager || {};
    
    if (!userCapabilities) return false;
    
    // Om användaren är WordPress-admin
    if (userCapabilities.isAdmin) return true;
    
    // Kontrollera om användaren har rollen i någon organisation
    if (userCapabilities.organizations) {
        return userCapabilities.organizations.some(org => {
            if (role === 'admin') return org.role === 'admin';
            if (role === 'scheduler') return org.role === 'admin' || org.role === 'scheduler';
            if (role === 'base') return true; // Alla användare har minst bas-roll
            return false;
        });
    }
    
    return false;
}

/**
 * Get the user's role in a specific organization
 * 
 * @param {number} organizationId - The organization ID
 * @returns {string|null} - The user's role in the organization, or null if not a member
 */
export function getUserRoleInOrganization(organizationId) {
    const { userCapabilities } = window.wpScheduleManager || {};
    
    if (!userCapabilities) return null;
    
    // Om användaren är WordPress-admin
    if (userCapabilities.isAdmin) return 'admin';
    
    // Hitta användarens roll i organisationen
    if (userCapabilities.organizations) {
        const org = userCapabilities.organizations.find(
            org => org.id === parseInt(organizationId, 10)
        );
        if (org) {
            return org.role;
        }
    }
    
    return null;
}
