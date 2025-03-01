<?php
/**
 * Database operations for the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_DB {

    /**
     * Create the database tables needed for the plugin.
     *
     * @since    1.0.0
     */
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Define table names with WordPress prefix
        $organizations_table = $wpdb->prefix . 'schedule_organizations';
        $user_organizations_table = $wpdb->prefix . 'schedule_user_organizations';
        $shifts_table = $wpdb->prefix . 'schedule_shifts';
        $user_roles_table = $wpdb->prefix . 'schedule_user_roles';
        
        // SQL for creating organizations table
        $organizations_sql = "CREATE TABLE $organizations_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            parent_id bigint(20) DEFAULT NULL,
            path varchar(255) DEFAULT '/',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY parent_id (parent_id)
        ) $charset_collate;";
        
        // SQL for creating user organizations table
        $user_organizations_sql = "CREATE TABLE $user_organizations_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            organization_id bigint(20) NOT NULL,
            role varchar(50) NOT NULL DEFAULT 'base',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY user_org (user_id,organization_id),
            KEY user_id (user_id),
            KEY organization_id (organization_id)
        ) $charset_collate;";
        
        // SQL for creating shifts table
        $shifts_sql = "CREATE TABLE $shifts_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            organization_id bigint(20) NOT NULL,
            resource_id bigint(20) DEFAULT NULL,
            user_id bigint(20) DEFAULT NULL,
            title varchar(255) NOT NULL,
            description text,
            start_time datetime NOT NULL,
            end_time datetime NOT NULL,
            status varchar(50) NOT NULL DEFAULT 'open',
            created_by bigint(20) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY organization_id (organization_id),
            KEY resource_id (resource_id),
            KEY user_id (user_id),
            KEY created_by (created_by),
            KEY status (status)
        ) $charset_collate;";
        
        // SQL for creating user roles table
        $user_roles_sql = "CREATE TABLE $user_roles_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            role varchar(50) NOT NULL DEFAULT 'base',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY user_id (user_id),
            CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES $wpdb->users (ID) ON DELETE CASCADE
        ) $charset_collate;";
        
        // Include WordPress database upgrade functions
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Create the tables
        dbDelta($organizations_sql);
        dbDelta($user_organizations_sql);
        dbDelta($shifts_sql);
        dbDelta($user_roles_sql);
    }
}
