<?php
/**
 * Fired during plugin activation.
 *
 * @link       https://example.com
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
     * Create required database tables on plugin activation.
     *
     * @since    1.0.0
     */
    public static function activate() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Create organizations table
        $table_name = $wpdb->prefix . 'schedule_manager_organizations';
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            parent_id bigint(20),
            path varchar(255),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY parent_id (parent_id)
        ) $charset_collate;";

        // Create user organizations table
        $table_user_orgs = $wpdb->prefix . 'schedule_manager_user_organizations';
        $sql .= "CREATE TABLE IF NOT EXISTS $table_user_orgs (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            organization_id bigint(20) NOT NULL,
            role varchar(50) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY user_org (user_id, organization_id),
            KEY organization_id (organization_id)
        ) $charset_collate;";

        // Create shifts table
        $table_shifts = $wpdb->prefix . 'schedule_manager_shifts';
        $sql .= "CREATE TABLE IF NOT EXISTS $table_shifts (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            organization_id bigint(20) NOT NULL,
            user_id bigint(20),
            start_time datetime NOT NULL,
            end_time datetime NOT NULL,
            notes text,
            status varchar(50) DEFAULT 'open',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY organization_id (organization_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
