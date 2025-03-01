<?php
/**
 * Plugin Name: WP Schedule Manager
 * Plugin URI: https://example.com/wp-schedule-manager
 * Description: A comprehensive scheduling plugin for WordPress with organization hierarchy and permission management.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * Text Domain: wp-schedule-manager
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('WP_SCHEDULE_MANAGER_VERSION', '1.0.0');
define('WP_SCHEDULE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_SCHEDULE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP_SCHEDULE_MANAGER_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include required files
require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager.php';

// Activation and deactivation hooks
register_activation_hook(__FILE__, array('WP_Schedule_Manager', 'activate'));
register_deactivation_hook(__FILE__, array('WP_Schedule_Manager', 'deactivate'));

// Initialize the plugin
function run_wp_schedule_manager() {
    $plugin = new WP_Schedule_Manager();
    $plugin->run();
}
run_wp_schedule_manager();

// Hook to automatically assign admin plugin role when a user is promoted to WordPress admin
function wp_schedule_manager_user_role_changed($user_id, $role, $old_roles) {
    try {
        // If user was promoted to administrator
        if ($role === 'administrator') {
            // Include the Role class if needed
            if (!class_exists('WP_Schedule_Manager_Role')) {
                require_once plugin_dir_path(__FILE__) . 'includes/class-wp-schedule-manager-role.php';
            }
            
            // Set the user as admin in the plugin
            WP_Schedule_Manager_Role::set_user_role($user_id, WP_Schedule_Manager_Role::ROLE_ADMIN);
            
            // Add the admin to all organizations
            wp_schedule_manager_add_admin_to_all_orgs($user_id);
        }
    } catch (Exception $e) {
        error_log('WP Schedule Manager: Error handling role change - ' . $e->getMessage());
    }
}
add_action('set_user_role', 'wp_schedule_manager_user_role_changed', 10, 3);

/**
 * Add a WordPress admin to all organizations with admin role
 */
function wp_schedule_manager_add_admin_to_all_orgs($user_id) {
    global $wpdb;
    
    try {
        // Get all organizations
        $organizations = $wpdb->get_results("SELECT id FROM {$wpdb->prefix}schedule_organizations");
        
        if (empty($organizations)) {
            return;
        }
        
        // Prepare bulk insert data
        $bulk_data = [];
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        foreach ($organizations as $org) {
            $bulk_data[] = [
                'user_id' => $user_id,
                'organization_id' => $org->id,
                'role' => 'admin'
            ];
        }
        
        // Perform bulk insert
        $wpdb->query("INSERT IGNORE INTO $table_name (user_id, organization_id, role) VALUES " . 
            implode(',', array_map(function($data) {
                return "({$data['user_id']}, {$data['organization_id']}, '{$data['role']}')";
            }, $bulk_data))
        );
    } catch (Exception $e) {
        error_log('WP Schedule Manager: Error adding admin to organizations - ' . $e->getMessage());
    }
}

/**
 * Hook to add admin to new organizations when they are created
 */
function wp_schedule_manager_organization_created($org_id) {
    global $wpdb;
    
    try {
        // Get all WordPress administrators
        $admin_users = get_users([
            'role' => 'administrator',
            'fields' => ['ID']
        ]);
        
        if (empty($admin_users)) {
            return;
        }
        
        // Prepare bulk insert data
        $bulk_data = [];
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        
        foreach ($admin_users as $admin) {
            $bulk_data[] = [
                'user_id' => $admin->ID,
                'organization_id' => $org_id,
                'role' => 'admin'
            ];
        }
        
        // Perform bulk insert
        $wpdb->query("INSERT IGNORE INTO $table_name (user_id, organization_id, role) VALUES " . 
            implode(',', array_map(function($data) {
                return "({$data['user_id']}, {$data['organization_id']}, '{$data['role']}')";
            }, $bulk_data))
        );
    } catch (Exception $e) {
        error_log('WP Schedule Manager: Error adding admins to new organization - ' . $e->getMessage());
    }
}
add_action('wp_schedule_manager_organization_created', 'wp_schedule_manager_organization_created');
