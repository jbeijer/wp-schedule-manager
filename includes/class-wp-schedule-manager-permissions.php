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
        if ($this->is_wordpress_admin($user_id)) {
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
        if ($this->is_wordpress_admin($user_id)) {
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
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-role.php';
        if (WP_Schedule_Manager_Role::user_has_role($user_id, WP_Schedule_Manager_Role::ROLE_SCHEDULER)) {
            return $this->user_organization->is_member($user_id, $organization_id);
        }
        
        return false;
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
        if ($this->is_wordpress_admin($user_id)) {
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
        if ($this->is_wordpress_admin($user_id)) {
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
        
        // For development purposes, allow all logged-in users to view organizations
        // Remove this in production
        if (is_user_logged_in()) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if a user can view organizations for another user.
     *
     * @since    1.0.0
     * @param    int       $target_user_id    The user ID to view organizations for.
     * @return   bool                         True if the user can view organizations, false otherwise.
     */
    public function user_can_view_organizations_for_user($target_user_id) {
        $current_user_id = get_current_user_id();
        
        // Users can view their own organizations
        if ($current_user_id == $target_user_id) {
            return true;
        }
        
        // WordPress administrators can view all
        if ($this->is_wordpress_admin($current_user_id)) {
            return true;
        }
        
        // Check if current user is an admin in any organization the target user belongs to
        $target_user_orgs = $this->user_organization->get_user_organizations($target_user_id);
        foreach ($target_user_orgs as $org) {
            if ($this->user_organization->user_has_role($current_user_id, $org->organization_id, 'admin')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if a user can create an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   bool                  True if the user can create an organization, false otherwise.
     */
    public function user_can_create_organization($user_id) {
        // WordPress administrators can create organizations
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Add additional permission checks here if needed
        
        // By default, only administrators can create organizations
        return false;
    }

    /**
     * Check if a user can add users to an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can add users, false otherwise.
     */
    public function user_can_add_to_organization($organization_id) {
        $current_user_id = get_current_user_id();
        
        // WordPress administrators can add users
        if ($this->is_wordpress_admin($current_user_id)) {
            return true;
        }
        
        // Organization admins can add users
        if ($this->user_organization->user_has_role($current_user_id, $organization_id, 'admin')) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if a user can remove users from an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can remove users, false otherwise.
     */
    public function user_can_remove_from_organization($organization_id) {
        // Same permissions as adding users
        return $this->user_can_add_to_organization($organization_id);
    }

    /**
     * Check if user can update roles in an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can update roles, false otherwise.
     */
    public function user_can_update_roles_in_organization($organization_id) {
        // Same permissions as adding users
        return $this->user_can_add_to_organization($organization_id);
    }

    /**
     * Check if a user can view a schedule.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can view the schedule, false otherwise.
     */
    public function can_view_schedule($user_id, $organization_id) {
        // WordPress-administratörer kan alltid se scheman
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Kontrollera om användaren har view_schedule capability
        if (!user_can($user_id, 'view_schedule')) {
            return false;
        }
        
        // Kontrollera om användaren är medlem i organisationen
        return $this->user_organization->is_member($user_id, $organization_id);
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
        // WordPress-administratörer kan alltid boka pass
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Grundläggande behörighetskontroll
        if (!user_can($user_id, 'manage_own_shifts')) {
            return false;
        }
        
        // Om det är någon annans pass, kontrollera om användaren är schemaläggare
        if (isset($shift->user_id) && $shift->user_id !== $user_id) {
            $user_role = $this->user_organization->get_user_role($user_id, $shift->organization_id);
            if ($user_role !== 'scheduler' && $user_role !== 'admin') {
                return false;
            }
        }
        
        // Kontrollera om användaren är medlem i organisationen
        if (!$this->user_organization->is_member($user_id, $shift->organization_id)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if a user can manage all shifts in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can manage shifts, false otherwise.
     */
    public function can_manage_shifts($user_id, $organization_id) {
        // WordPress-administratörer kan alltid hantera pass
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Kontrollera om användaren har manage_all_shifts capability
        if (!user_can($user_id, 'manage_all_shifts')) {
            return false;
        }
        
        // Kontrollera användarens roll i organisationen
        $user_role = $this->user_organization->get_user_role($user_id, $organization_id);
        return $user_role === 'scheduler' || $user_role === 'admin';
    }
    
    /**
     * Check if a user can manage resources in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True if the user can manage resources, false otherwise.
     */
    public function can_manage_resources($user_id, $organization_id) {
        // WordPress-administratörer kan alltid hantera resurser
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Kontrollera om användaren har manage_resources capability
        if (!user_can($user_id, 'manage_resources')) {
            return false;
        }
        
        // Kontrollera användarens roll i organisationen
        $user_role = $this->user_organization->get_user_role($user_id, $organization_id);
        return $user_role === 'admin';
    }
    
    /**
     * Check if a user has scheduler role in any organization.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   bool                  True if the user has scheduler role anywhere, false otherwise.
     */
    public function user_has_scheduler_role_anywhere($user_id) {
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        $user_orgs = $this->user_organization->get_user_organizations($user_id);
        
        foreach ($user_orgs as $user_org) {
            if ($user_org->role === 'scheduler' || $user_org->role === 'admin') {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if a user has admin role in any organization.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   bool                  True if the user has admin role anywhere, false otherwise.
     */
    public function user_has_admin_role_anywhere($user_id) {
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        $user_orgs = $this->user_organization->get_user_organizations($user_id);
        
        foreach ($user_orgs as $user_org) {
            if ($user_org->role === 'admin') {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if user is a WordPress administrator.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   bool                  True if the user is a WordPress admin, false otherwise.
     */
    private function is_wordpress_admin($user_id) {
        return user_can($user_id, 'administrator');
    }

    /**
     * Get all user capabilities for the React app.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   array                 The user capabilities.
     */
    public function get_user_capabilities($user_id) {
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-role.php';
        $is_wp_admin = $this->is_wordpress_admin($user_id);

        $capabilities = array(
            'isAdmin' => $is_wp_admin,
            'role' => $is_wp_admin ? 'admin' : WP_Schedule_Manager_Role::get_user_role($user_id),
            'viewSchedule' => $is_wp_admin || user_can($user_id, 'view_schedule'),
            'manageOwnShifts' => $is_wp_admin || user_can($user_id, 'manage_own_shifts'),
            'manageAllShifts' => $is_wp_admin || user_can($user_id, 'manage_all_shifts'),
            'manageResources' => $is_wp_admin || user_can($user_id, 'manage_resources'),
            'organizations' => array()
        );
        
        // For WordPress admins, if they're not part of any organizations yet,
        // we'll still need to add organizations they have access to
        if ($is_wp_admin) {
            // Get all organizations
            $all_orgs = $this->organization->all();
            foreach ($all_orgs as $org) {
                $capabilities['organizations'][] = array(
                    'id' => $org->id,
                    'name' => $org->name,
                    'role' => 'admin',
                    'viewSchedule' => true,
                    'bookShift' => true,
                    'manageShift' => true,
                    'manageResources' => true
                );
            }
        } else {
            $user_orgs = $this->user_organization->get_user_organizations($user_id);
            foreach ($user_orgs as $user_org) {
                $capabilities['organizations'][] = array(
                    'id' => $user_org->organization_id,
                    'name' => $user_org->organization_name,
                    'role' => $user_org->role,
                    'viewSchedule' => true,
                    'bookShift' => true,
                    'manageShift' => $user_org->role === 'scheduler' || $user_org->role === 'admin',
                    'manageResources' => $user_org->role === 'admin'
                );
            }
        }

        return $capabilities;
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
        // WordPress-administratörer kan alltid redigera pass
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        // Kontrollera om användaren har behörighet att hantera pass
        if (!user_can($user_id, 'manage_own_shifts')) {
            return false;
        }
        
        // Om det är användarens eget pass
        if (isset($shift->user_id) && $shift->user_id == $user_id) {
            return true;
        }
        
        // Om det är någon annans pass, kontrollera om användaren är schemaläggare eller admin
        $user_role = $this->user_organization->get_user_role($user_id, $shift->organization_id);
        if ($user_role !== 'scheduler' && $user_role !== 'admin') {
            return false;
        }
        
        // Kontrollera om användaren är medlem i organisationen
        if (!$this->user_organization->is_member($user_id, $shift->organization_id)) {
            return false;
        }
        
        return true;
    }
}
