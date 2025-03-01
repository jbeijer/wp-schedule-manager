<?php
/**
 * User Role model for the plugin.
 */
class WP_Schedule_Manager_Role {
    
    // Define roles
    const ROLE_BASE = 'bas';
    const ROLE_SCHEDULER = 'schemalaggare';
    const ROLE_ADMIN = 'admin';

    /**
     * Get a user's global role.
     */
    public static function get_user_role($user_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'schedule_user_roles';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            return self::ROLE_BASE;
        }
        
        $role = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT role FROM $table_name WHERE user_id = %d",
                $user_id
            )
        );
        
        return $role ? $role : self::ROLE_BASE;
    }

    /**
     * Set a user's global role.
     */
    public static function set_user_role($user_id, $role) {
        global $wpdb;
        
        if (!in_array($role, [self::ROLE_BASE, self::ROLE_SCHEDULER, self::ROLE_ADMIN])) {
            return false;
        }
        
        $table_name = $wpdb->prefix . 'schedule_user_roles';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';
            WP_Schedule_Manager_DB::create_tables();
        }
        
        $existing_role = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $table_name WHERE user_id = %d",
                $user_id
            )
        );
        
        if ($existing_role) {
            return $wpdb->update(
                $table_name,
                ['role' => $role],
                ['user_id' => $user_id],
                ['%s'],
                ['%d']
            );
        } else {
            return $wpdb->insert(
                $table_name,
                [
                    'user_id' => $user_id,
                    'role' => $role
                ],
                ['%d', '%s']
            );
        }
    }

    /**
     * Check if a user has a specific role or higher.
     */
    public static function user_has_role($user_id, $role) {
        $user_role = self::get_user_role($user_id);
        
        if ($user_role === self::ROLE_ADMIN) {
            return true;
        }
        
        if ($role === self::ROLE_BASE && $user_role === self::ROLE_SCHEDULER) {
            return true;
        }
        
        return $user_role === $role;
    }
}
