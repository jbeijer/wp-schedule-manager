/**
 * Utility functions for checking user permissions in the React app
 */

/**
 * Check if the current user can perform a specific action
 * 
 * @param {string} action - The action to check (e.g., 'viewSchedule', 'manageShift', 'manageResources')
 * @param {number|null} organizationId - The organization ID to check permissions for, or null for global permissions
 * @returns {boolean} - Whether the user can perform the action
 * @throws {Error} - If invalid parameters are provided
 */
export function canUserPerformAction(action, organizationId = null) {
    if (typeof action !== 'string' || action.trim() === '') {
        throw new Error('Action must be a non-empty string');
    }

    if (organizationId !== null && (typeof organizationId !== 'number' || isNaN(organizationId))) {
        throw new Error('Organization ID must be a number or null');
    }

    const userCapabilities = window.wpScheduleManager?.userCapabilities || {};

    // Admin has all permissions
    if (userCapabilities.isAdmin || userCapabilities.role === 'admin') return true;

    // Scheduler can manage schedules and shifts
    if (userCapabilities.role === 'schemaläggare' && 
        (action === 'viewSchedule' || action === 'manageShift')) {
        return true;
    }

    // Check organization-specific permissions
    if (organizationId && userCapabilities.organizations) {
        // Handle both array and object formats of organizations
        const orgs = Array.isArray(userCapabilities.organizations) 
            ? userCapabilities.organizations 
            : Object.values(userCapabilities.organizations);

        const orgCaps = orgs.find(org => 
            org && org.id === parseInt(organizationId, 10)
        );

        if (orgCaps && orgCaps[action] === true) {
            return true;
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
 * @throws {Error} - If invalid parameters are provided
 */
export function userHasRoleAnywhere(role) {
    if (typeof role !== 'string' || role.trim() === '') {
        throw new Error('Role must be a non-empty string');
    }

    const userCapabilities = window.wpScheduleManager?.userCapabilities || {};

    // If user is WordPress-admin
    if (userCapabilities.isAdmin) return true;

    // Check if user has the role in any organization
    if (userCapabilities.organizations) {
        // Handle both array and object formats of organizations
        const orgs = Array.isArray(userCapabilities.organizations) 
            ? userCapabilities.organizations 
            : Object.values(userCapabilities.organizations);

        return orgs.some(org => {
            if (!org) return false;
            if (role === 'admin') return org.role === 'admin';
            if (role === 'scheduler') return org.role === 'admin' || org.role === 'scheduler';
            if (role === 'base') return true; // All users have at least base role
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
 * @throws {Error} - If invalid parameters are provided
 */
export function getUserRoleInOrganization(organizationId) {
    if (typeof organizationId !== 'number' || isNaN(organizationId)) {
        throw new Error('Organization ID must be a number');
    }

    const userCapabilities = window.wpScheduleManager?.userCapabilities || {};

    // If user is WordPress-admin
    if (userCapabilities.isAdmin) return 'admin';

    // Find user's role in the organization
    if (userCapabilities.organizations) {
        // Handle both array and object formats of organizations
        const orgs = Array.isArray(userCapabilities.organizations) 
            ? userCapabilities.organizations 
            : Object.values(userCapabilities.organizations);

        const org = orgs.find(org => 
            org && org.id === parseInt(organizationId, 10)
        );

        if (org) {
            return org.role;
        }
    }

    return null;
}
