<?php
/**
 * User Organization model for the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_User_Organization {

    /**
     * Get all user-organization relationships.
     *
     * @since    1.0.0
     * @return   array    Array of user-organization relationships.
     */
    public function get_all() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return empty array
            return array();
        }
        
        $results = $wpdb->get_results("SELECT * FROM $table_name");
        
        return $results;
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
     * Get user-organization relationships for a specific user.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   array     Array of user-organization relationships.
     */
    public function get_user_organizations($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return empty array
            return array();
        }
        
        // If user is a WordPress admin, get all organizations and assign admin role
        if ($this->is_wordpress_admin($user_id)) {
            $orgs = $wpdb->get_results(
                "SELECT o.id as organization_id, o.name as organization_name, 
                 o.description as organization_description, o.parent_id,
                 'admin' as role
                 FROM {$wpdb->prefix}schedule_organizations o"
            );
            
            if (!empty($orgs)) {
                return $orgs;
            }
        }
        
        // Regular query for non-admins or as fallback if no orgs found above
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT uo.*, o.name as organization_name, o.description as organization_description, o.parent_id
            FROM $table_name uo
            JOIN {$wpdb->prefix}schedule_organizations o ON uo.organization_id = o.id
            WHERE uo.user_id = %d",
            $user_id
        ));
        
        return $results;
    }
    
    /**
     * Get users for a specific organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array     Array of user-organization relationships.
     */
    public function get_organization_users($organization_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return empty array
            return array();
        }
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT uo.*, u.display_name as user_name, u.user_email as user_email
             FROM $table_name uo
             JOIN {$wpdb->users} u ON uo.user_id = u.ID
             WHERE uo.organization_id = %d",
            $organization_id
        ));
        
        return $results;
    }
    
    /**
     * Get a user's role in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   string|null                   The user's role or null if not found.
     */
    public function get_user_role($user_id, $organization_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return null
            return null;
        }
        
        // WordPress administrators always have admin role in all organizations
        if ($this->is_wordpress_admin($user_id)) {
            return 'admin';
        }
        
        // For regular users, check the database
        $result = $wpdb->get_var($wpdb->prepare(
            "SELECT role FROM $table_name WHERE user_id = %d AND organization_id = %d",
            $user_id,
            $organization_id
        ));
        
        return $result;
    }
    
    /**
     * Check if a user has a specific role in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @param    string    $role              The role to check.
     * @return   bool                         True if the user has the role, false otherwise.
     */
    public function user_has_role($user_id, $organization_id, $role) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return false
            return false;
        }
        
        // WordPress administrators always have admin role everywhere
        if ($this->is_wordpress_admin($user_id)) {
            return true;
        }
        
        $user_role = $this->get_user_role($user_id, $organization_id);
        
        if (!$user_role) {
            return false;
        }
        
        // Define role hierarchy
        $role_hierarchy = array(
            'base' => 1,
            'scheduler' => 2,
            'admin' => 3
        );
        
        // Check if user's role is equal or higher in hierarchy
        return $role_hierarchy[$user_role] >= $role_hierarchy[$role];
    }
    
    /**
     * Create a new user-organization relationship.
     *
     * @since    1.0.0
     * @param    array     $data    The user-organization data.
     * @return   int       The new relationship ID.
     */
    public function create($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, create it
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';
            WP_Schedule_Manager_DB::create_tables();
        }
        
        // Check if the relationship already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table_name WHERE user_id = %d AND organization_id = %d",
            $data['user_id'],
            $data['organization_id']
        ));
        
        if ($existing) {
            // Update the existing relationship
            $this->update($existing, $data);
            return $existing;
        }
        
        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $data['user_id'],
                'organization_id' => $data['organization_id'],
                'role' => isset($data['role']) ? $data['role'] : 'base',
            ),
            array('%d', '%d', '%s')
        );
        
        return $wpdb->insert_id;
    }
    
    /**
     * Update a user-organization relationship.
     *
     * @since    1.0.0
     * @param    int       $id      The relationship ID.
     * @param    array     $data    The user-organization data.
     * @return   bool      True on success, false on failure.
     */
    public function update($id, $data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        $update_data = array();
        $format = array();
        
        if (isset($data['role'])) {
            $update_data['role'] = $data['role'];
            $format[] = '%s';
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $result = $wpdb->update(
            $table_name,
            $update_data,
            array('id' => $id),
            $format,
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Delete a user-organization relationship.
     *
     * @since    1.0.0
     * @param    int       $id    The relationship ID.
     * @return   bool      True on success, false on failure.
     */
    public function delete($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        $result = $wpdb->delete(
            $table_name,
            array('id' => $id),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Delete all user-organization relationships for a user.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   bool      True on success, false on failure.
     */
    public function delete_user_relationships($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        $result = $wpdb->delete(
            $table_name,
            array('user_id' => $user_id),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Delete all user-organization relationships for an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   bool      True on success, false on failure.
     */
    public function delete_organization_relationships($organization_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        $result = $wpdb->delete(
            $table_name,
            array('organization_id' => $organization_id),
            array('%d')
        );
        
        return $result !== false;
    }
}
