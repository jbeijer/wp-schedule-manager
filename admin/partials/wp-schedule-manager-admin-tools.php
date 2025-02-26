<?php
/**
 * Provide a admin area view for the plugin tools page
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    WP_Schedule_Manager
 * @subpackage WP_Schedule_Manager/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="card">
        <h2><?php _e('Database Migrations', 'wp-schedule-manager'); ?></h2>
        <p><?php _e('Use these tools to update database structures and migrate data when needed.', 'wp-schedule-manager'); ?></p>
        
        <div class="tool-section">
            <h3><?php _e('Update Organization Paths', 'wp-schedule-manager'); ?></h3>
            <p><?php _e('This tool will update the path column for all organizations in the database to support hierarchical organization management.', 'wp-schedule-manager'); ?></p>
            <form method="post" action="">
                <?php wp_nonce_field('wp_schedule_manager_run_migration_nonce'); ?>
                <input type="submit" name="wp_schedule_manager_run_migration" class="button button-primary" value="<?php _e('Run Migration', 'wp-schedule-manager'); ?>">
            </form>
        </div>
    </div>
</div>
