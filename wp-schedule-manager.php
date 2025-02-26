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
