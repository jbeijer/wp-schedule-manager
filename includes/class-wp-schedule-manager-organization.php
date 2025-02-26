<?php
/**
 * Organization model for the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Organization {

    /**
     * Get all organizations.
     *
     * @since    1.0.0
     * @return   array    Array of organizations.
     */
    public function get_all() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return empty array
            return array();
        }
        
        $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY name ASC");
        
        return $results;
    }
    
    /**
     * Get a single organization.
     *
     * @since    1.0.0
     * @param    int       $id    The organization ID.
     * @return   object    The organization object.
     */
    public function get($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return null
            return null;
        }
        
        $result = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
        
        return $result;
    }
    
    /**
     * Get parent organizations for an organization.
     *
     * @since    1.0.0
     * @param    int       $id    The organization ID.
     * @return   array     Array of parent organization objects.
     */
    public function get_parents($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, return empty array
            return array();
        }
        
        $parents = array();
        $current_org = $this->get($id);
        
        while ($current_org && $current_org->parent_id) {
            $parent = $this->get($current_org->parent_id);
            if ($parent) {
                $parents[] = $parent;
                $current_org = $parent;
            } else {
                break;
            }
        }
        
        return $parents;
    }
    
    /**
     * Create a new organization.
     *
     * @since    1.0.0
     * @param    array     $data    The organization data.
     * @return   int       The new organization ID.
     */
    public function create($data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            // Table doesn't exist, create it
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';
            WP_Schedule_Manager_DB::create_tables();
        }
        
        $wpdb->insert(
            $table_name,
            array(
                'name' => $data['name'],
                'description' => isset($data['description']) ? $data['description'] : '',
                'parent_id' => isset($data['parent_id']) ? $data['parent_id'] : null,
            ),
            array('%s', '%s', '%d')
        );
        
        return $wpdb->insert_id;
    }
    
    /**
     * Update an organization.
     *
     * @since    1.0.0
     * @param    int       $id      The organization ID.
     * @param    array     $data    The organization data.
     * @return   bool      True on success, false on failure.
     */
    public function update($id, $data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        $update_data = array();
        $format = array();
        
        if (isset($data['name'])) {
            $update_data['name'] = $data['name'];
            $format[] = '%s';
        }
        
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
            $format[] = '%s';
        }
        
        if (isset($data['parent_id'])) {
            $update_data['parent_id'] = $data['parent_id'];
            $format[] = '%d';
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
     * Delete an organization.
     *
     * @since    1.0.0
     * @param    int       $id    The organization ID.
     * @return   bool      True on success, false on failure.
     */
    public function delete($id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_organizations';
        
        // Check if the table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return false;
        }
        
        // First, update any child organizations to remove the parent reference
        $wpdb->update(
            $table_name,
            array('parent_id' => null),
            array('parent_id' => $id),
            array('%d'),
            array('%d')
        );
        
        // Now delete the organization
        $result = $wpdb->delete(
            $table_name,
            array('id' => $id),
            array('%d')
        );
        
        return $result !== false;
    }
}
