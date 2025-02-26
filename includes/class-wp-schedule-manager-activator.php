<?php

/**
 * Fired during plugin activation
 *
 * @link       https://www.example.com
 * @since      1.0.0
 *
 * @package    WP_Schedule_Manager
 * @subpackage WP_Schedule_Manager/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    WP_Schedule_Manager
 * @subpackage WP_Schedule_Manager/includes
 * @author     Your Name <email@example.com>
 */
class WP_Schedule_Manager_Activator {

    /**
     * Short Description. (use period)
     *
     * Long Description.
     *
     * @since    1.0.0
     */
    public static function activate() {
        // Create database tables
        self::create_tables();
        
        // Create sample organization
        self::create_sample_organization();
        
        // Set version
        update_option('wp_schedule_manager_version', WP_SCHEDULE_MANAGER_VERSION);
    }
    
    /**
     * Create database tables
     *
     * @since    1.0.0
     */
    private static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // User organizations table
        $table_name = $wpdb->prefix . 'schedule_user_organizations';
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            organization_id mediumint(9) NOT NULL,
            role varchar(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_org (user_id, organization_id)
        ) $charset_collate;";
        
        // Shifts table
        $table_name = $wpdb->prefix . 'schedule_shifts';
        $sql .= "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            organization_id mediumint(9) NOT NULL,
            resource_id mediumint(9) NOT NULL,
            user_id mediumint(9) NULL,
            start_time datetime NOT NULL,
            end_time datetime NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'open',
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Create a sample organization
     *
     * @since    1.0.0
     */
    private static function create_sample_organization() {
        // Check if we already have organizations
        $args = array(
            'post_type'      => 'schedule_organization',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
        );
        
        $posts = get_posts($args);
        
        // If no organizations exist, create a sample one
        if (empty($posts)) {
            $post_data = array(
                'post_title'   => 'Sample Organization',
                'post_content' => 'This is a sample organization created during plugin activation.',
                'post_status'  => 'publish',
                'post_type'    => 'schedule_organization',
            );
            
            wp_insert_post($post_data);
        }
    }
}
