<?php
/**
 * Migration script to update organization paths
 *
 * This script updates the path column for all existing organizations
 * in the wp_schedule_organizations table.
 *
 * @package WP_Schedule_Manager
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Update organization paths migration
 */
function wp_schedule_manager_update_organization_paths() {
    global $wpdb;
    
    // Get the table name
    $table_name = $wpdb->prefix . 'schedule_organizations';
    
    // Check if the table exists
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
        return false;
    }
    
    // Check if the path column exists
    $column_exists = $wpdb->get_results("SHOW COLUMNS FROM $table_name LIKE 'path'");
    if (empty($column_exists)) {
        // Add the path column if it doesn't exist
        $wpdb->query("ALTER TABLE $table_name ADD COLUMN path VARCHAR(255) DEFAULT '/' AFTER parent_id");
    }
    
    // Get all organizations
    $organizations = $wpdb->get_results("SELECT * FROM $table_name ORDER BY id ASC");
    
    if (empty($organizations)) {
        return false;
    }
    
    // Create a map of organizations by ID for easy lookup
    $org_map = array();
    foreach ($organizations as $org) {
        $org_map[$org->id] = $org;
    }
    
    // Update paths for all organizations
    foreach ($organizations as $org) {
        $path = wp_schedule_manager_calculate_org_path($org, $org_map);
        $wpdb->update(
            $table_name,
            array('path' => $path),
            array('id' => $org->id)
        );
    }
    
    return true;
}

/**
 * Calculate the path for an organization
 *
 * @param object $org The organization object
 * @param array $org_map Map of organizations by ID
 * @return string The calculated path
 */
function wp_schedule_manager_calculate_org_path($org, $org_map) {
    // If no parent, this is a root organization
    if (empty($org->parent_id)) {
        return '/' . $org->id . '/';
    }
    
    // Build the path by traversing up the parent chain
    $path = '';
    $current_org = $org;
    $visited = array(); // To prevent infinite loops from circular references
    
    while (!empty($current_org->parent_id) && !in_array($current_org->id, $visited)) {
        $visited[] = $current_org->id;
        
        // Get the parent
        if (!isset($org_map[$current_org->parent_id])) {
            // Parent not found, treat as root
            break;
        }
        
        $current_org = $org_map[$current_org->parent_id];
        $path = '/' . $current_org->id . $path;
    }
    
    // Add the current org ID to the path
    $path .= $org->id . '/';
    
    // Ensure the path starts with a slash
    if (substr($path, 0, 1) !== '/') {
        $path = '/' . $path;
    }
    
    return $path;
}

// Run the migration
wp_schedule_manager_update_organization_paths();
