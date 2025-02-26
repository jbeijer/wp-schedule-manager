<?php
/**
 * Provide a admin area view for the plugin
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
    
    <div id="wp-schedule-manager-admin-app" data-page="dashboard">
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p><?php _e('Loading WP Schedule Manager...', 'wp-schedule-manager'); ?></p>
        </div>
    </div>
</div>
