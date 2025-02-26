<?php
/**
 * Create a test organization
 *
 * This file is used to create a test organization in the database.
 * It should be placed in the plugin directory and run via the browser.
 */

// Load WordPress
require_once dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php';

// Create the organization
$post_data = array(
    'post_title'   => 'Test Organization',
    'post_content' => 'This is a test organization',
    'post_status'  => 'publish',
    'post_type'    => 'schedule_organization',
);

$post_id = wp_insert_post($post_data);

if (is_wp_error($post_id)) {
    echo 'Error creating organization: ' . $post_id->get_error_message();
} else {
    echo 'Organization created with ID: ' . $post_id;
}
