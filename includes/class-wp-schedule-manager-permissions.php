<?php
/**
 * Permissions class for the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Permissions {

    /**
     * User organization model instance.
     *
     * @since    1.0.0
     * @access   private
     * @var      WP_Schedule_Manager_User_Organization    $user_organization    User organization model.
     */
    private $user_organization;

    /**
     * Organization model instance.
     *
     * @since    1.0.0
     * @access   private
     * @var      WP_Schedule_Manager_Organization    $organization    Organization model.
     */
    private $organization;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     */
    public function __construct() {
        $this->user_organization = new WP_Schedule_Manager_User_Organization();
        $this->organization = new WP_Schedule_Manager_Organization();
    }

    /**
     * Check if a user can view an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can view the organization, false otherwise.
     */
    public function can_view_organization($user_id, $organization_id) {
        // WordPress administrators can view all organizations
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // Check if user is a member of the organization
        if ($this->user_organization->get_user_role($user_id, $organization_id)) {
            return true;
        }
        
        // Check if user is a member of a parent organization with admin role
        $parents = $this->organization->get_parents($organization_id);
        foreach ($parents as $parent) {
            if ($this->user_organization->user_has_role($user_id, $parent->id, 'admin')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a user can edit an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can edit the organization, false otherwise.
     */
    public function can_edit_organization($user_id, $organization_id) {
        // WordPress administrators can edit all organizations
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // Check if user is an admin of the organization
        if ($this->user_organization->user_has_role($user_id, $organization_id, 'admin')) {
            return true;
        }
        
        // Check if user is an admin of a parent organization
        $parents = $this->organization->get_parents($organization_id);
        foreach ($parents as $parent) {
            if ($this->user_organization->user_has_role($user_id, $parent->id, 'admin')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a user can manage users in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can manage users, false otherwise.
     */
    public function can_manage_users($user_id, $organization_id) {
        // Same permissions as editing the organization
        return $this->can_edit_organization($user_id, $organization_id);
    }

    /**
     * Check if a user can create shifts in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can create shifts, false otherwise.
     */
    public function can_create_shifts($user_id, $organization_id) {
        // WordPress administrators can create shifts in all organizations
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // Schedulers and admins can create shifts
        return $this->user_organization->user_has_role($user_id, $organization_id, 'scheduler');
    }

    /**
     * Check if a user can edit a shift.
     *
     * @since    1.0.0
     * @param    int       $user_id     The user ID.
     * @param    object    $shift       The shift object.
     * @return   bool                   True if the user can edit the shift, false otherwise.
     */
    public function can_edit_shift($user_id, $shift) {
        // WordPress administrators can edit all shifts
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // Shift creator can edit their own shifts
        if ($shift->created_by == $user_id) {
            return true;
        }
        
        // Schedulers and admins can edit shifts in their organization
        if ($this->user_organization->user_has_role($user_id, $shift->organization_id, 'scheduler')) {
            return true;
        }
        
        // Check if user is a scheduler or admin of a parent organization
        $parents = $this->organization->get_parents($shift->organization_id);
        foreach ($parents as $parent) {
            if ($this->user_organization->user_has_role($user_id, $parent->id, 'admin')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a user can book a shift.
     *
     * @since    1.0.0
     * @param    int       $user_id     The user ID.
     * @param    object    $shift       The shift object.
     * @return   bool                   True if the user can book the shift, false otherwise.
     */
    public function can_book_shift($user_id, $shift) {
        // Can't book already assigned shifts
        if ($shift->status !== 'open') {
            return false;
        }
        
        // WordPress administrators can book all shifts
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // User must be a member of the organization
        if (!$this->user_organization->get_user_role($user_id, $shift->organization_id)) {
            return false;
        }
        
        // Check for scheduling conflicts
        $shift_model = new WP_Schedule_Manager_Shift();
        $user_shifts = $shift_model->get_user_shifts(
            $user_id, 
            'assigned', 
            date('Y-m-d', strtotime($shift->start_time)), 
            date('Y-m-d', strtotime($shift->end_time))
        );
        
        foreach ($user_shifts as $user_shift) {
            // Check for overlap
            if (
                (strtotime($user_shift->start_time) <= strtotime($shift->end_time)) &&
                (strtotime($user_shift->end_time) >= strtotime($shift->start_time))
            ) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if a user can view the admin interface.
     *
     * @since    1.0.0
     * @param    int       $user_id     The user ID.
     * @return   bool                   True if the user can view the admin interface, false otherwise.
     */
    public function can_view_admin($user_id) {
        // WordPress administrators can always view admin
        if (user_can($user_id, 'administrator')) {
            return true;
        }
        
        // Check if user is an admin or scheduler in any organization
        $user_orgs = $this->user_organization->get_user_organizations($user_id);
        foreach ($user_orgs as $user_org) {
            if (in_array($user_org->role, array('admin', 'scheduler'))) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get the highest role a user has across all organizations.
     *
     * @since    1.0.0
     * @param    int       $user_id     The user ID.
     * @return   string                 The highest role (admin, scheduler, base) or null if none.
     */
    public function get_highest_role($user_id) {
        // WordPress administrators are treated as having admin role
        if (user_can($user_id, 'administrator')) {
            return 'admin';
        }
        
        $user_orgs = $this->user_organization->get_user_organizations($user_id);
        $highest_role = null;
        
        // Define role hierarchy
        $role_hierarchy = array(
            'base' => 1,
            'scheduler' => 2,
            'admin' => 3
        );
        
        $highest_level = 0;
        
        foreach ($user_orgs as $user_org) {
            $role_level = $role_hierarchy[$user_org->role];
            if ($role_level > $highest_level) {
                $highest_level = $role_level;
                $highest_role = $user_org->role;
            }
        }
        
        return $highest_role;
    }

    /**
     * Check if the current user can view organizations.
     *
     * @since    1.0.0
     * @return   bool    True if the user can view organizations, false otherwise.
     */
    public function user_can_view_organizations() {
        // WordPress administrators can always view organizations
        if (current_user_can('administrator')) {
            return true;
        }
        
        // Get current user ID
        $user_id = get_current_user_id();
        
        // Check if user is a member of any organization
        $user_orgs = $this->user_organization->get_user_organizations($user_id);
        if (!empty($user_orgs)) {
            return true;
        }
        
        // For development purposes, allow all logged-in users to view organizations
        // Remove this in production
        if (is_user_logged_in()) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if the current user can view organizations for a specific user.
     *
     * @since    1.0.0
     * @param    int     $user_id    The user ID to check organizations for.
     * @return   bool                True if the user can view organizations for the specified user, false otherwise.
     */
    public function user_can_view_organizations_for_user($user_id) {
        // WordPress administrators can always view organizations for any user
        if (current_user_can('administrator')) {
            return true;
        }
        
        // Users can view their own organizations
        if (get_current_user_id() == $user_id) {
            return true;
        }
        
        // For development purposes, allow all logged-in users to view organizations
        // Remove this in production
        if (is_user_logged_in()) {
            return true;
        }
        
        return false;
    }
}
