<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Admin {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version    The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        $screen = get_current_screen();
        
        // Only load on plugin admin pages
        if (strpos($screen->id, 'wp-schedule-manager') === false) {
            return;
        }
        
        // Load the admin app styles on all plugin pages
        wp_enqueue_style(
            'wp-schedule-manager-admin-app',
            plugin_dir_url(__FILE__) . 'js/build/wp-schedule-manager-admin-asset-main.css',
            array(),
            $this->version,
            'all'
        );
        
        // Also load regular admin styles for all pages
        wp_enqueue_style(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'css/wp-schedule-manager-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        $screen = get_current_screen();
        
        // Only load on plugin admin pages
        if (strpos($screen->id, 'wp-schedule-manager') === false) {
            return;
        }
        
        // Get current user permissions
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';
        $permissions = new WP_Schedule_Manager_Permissions();
        $user_id = get_current_user_id();
        
        // Enqueue React app script
        wp_enqueue_script(
            'wp-schedule-manager-admin-app',
            WP_SCHEDULE_MANAGER_PLUGIN_URL . 'admin/js/build/wp-schedule-manager-admin.js',
            array('wp-element'),
            $this->version,
            true
        );
        
        // Localize script with plugin data
        wp_localize_script(
            'wp-schedule-manager-admin-app',
            'wpScheduleManager',
            array(
                'apiUrl' => esc_url_raw(rest_url('wp-schedule-manager/v1')),
                'nonce' => wp_create_nonce('wp_rest'),
                'userId' => $user_id,
                'userCapabilities' => $permissions->get_user_capabilities($user_id),
                'translations' => array(
                    'confirmDelete' => __('Är du säker på att du vill ta bort detta?', 'wp-schedule-manager'),
                    'bookShift' => __('Boka pass', 'wp-schedule-manager'),
                    'cancelShift' => __('Avboka pass', 'wp-schedule-manager'),
                    // Fler översättningar...
                )
            )
        );
        
        // Also load regular admin scripts for all pages
        wp_enqueue_script(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'js/wp-schedule-manager-admin.js',
            array('jquery'),
            $this->version,
            false
        );
    }

    /**
     * Add plugin admin menu items
     *
     * @since    1.0.0
     */
    public function add_admin_menu() {
        // Main menu item
        add_menu_page(
            __('WP Schedule Manager', 'wp-schedule-manager'),
            __('Schedule Manager', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager',
            array($this, 'display_admin_page'),
            'dashicons-calendar-alt',
            30
        );
        
        // Dashboard submenu (same as main menu)
        add_submenu_page(
            'wp-schedule-manager',
            __('Dashboard', 'wp-schedule-manager'),
            __('Dashboard', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager',
            array($this, 'display_admin_page')
        );
        
        // Organizations submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Organizations', 'wp-schedule-manager'),
            __('Organizations', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-organizations',
            array($this, 'display_organizations_page')
        );
        
        // Users submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Users', 'wp-schedule-manager'),
            __('Users', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-users',
            array($this, 'display_users_page')
        );
        
        // Resources submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Resources', 'wp-schedule-manager'),
            __('Resources', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-resources',
            array($this, 'display_resources_page')
        );
        
        // Shifts submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Shifts', 'wp-schedule-manager'),
            __('Shifts', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-shifts',
            array($this, 'display_shifts_page')
        );
        
        // Settings submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Settings', 'wp-schedule-manager'),
            __('Settings', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-settings',
            array($this, 'display_settings_page')
        );
        
        // Tools submenu
        add_submenu_page(
            'wp-schedule-manager',
            __('Tools', 'wp-schedule-manager'),
            __('Tools', 'wp-schedule-manager'),
            'manage_options',
            'wp-schedule-manager-tools',
            array($this, 'display_tools_page')
        );
    }
    
    /**
     * Display the main admin page
     *
     * @since    1.0.0
     */
    public function display_admin_page() {
        include_once 'partials/wp-schedule-manager-admin-display.php';
    }
    
    /**
     * Display the tools page
     *
     * @since    1.0.0
     */
    public function display_tools_page() {
        // Check if migration action was triggered
        if (isset($_POST['wp_schedule_manager_run_migration']) && 
            check_admin_referer('wp_schedule_manager_run_migration_nonce')) {
            
            // Run the migration
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/migrations/update-organization-paths.php';
            $result = wp_schedule_manager_update_organization_paths();
            
            if ($result) {
                echo '<div class="notice notice-success is-dismissible"><p>' . 
                    __('Organization paths updated successfully.', 'wp-schedule-manager') . 
                    '</p></div>';
            } else {
                echo '<div class="notice notice-error is-dismissible"><p>' . 
                    __('Failed to update organization paths.', 'wp-schedule-manager') . 
                    '</p></div>';
            }
        }
        
        // Display the tools page
        include_once 'partials/wp-schedule-manager-admin-tools.php';
    }

    /**
     * Register the resource custom post type.
     *
     * @since    1.0.0
     */
    public function register_resource_post_type() {
        $labels = array(
            'name'                  => _x('Resources', 'Post type general name', 'wp-schedule-manager'),
            'singular_name'         => _x('Resource', 'Post type singular name', 'wp-schedule-manager'),
            'menu_name'             => _x('Resources', 'Admin Menu text', 'wp-schedule-manager'),
            'name_admin_bar'        => _x('Resource', 'Add New on Toolbar', 'wp-schedule-manager'),
            'add_new'               => __('Add New', 'wp-schedule-manager'),
            'add_new_item'          => __('Add New Resource', 'wp-schedule-manager'),
            'new_item'              => __('New Resource', 'wp-schedule-manager'),
            'edit_item'             => __('Edit Resource', 'wp-schedule-manager'),
            'view_item'             => __('View Resource', 'wp-schedule-manager'),
            'all_items'             => __('All Resources', 'wp-schedule-manager'),
            'search_items'          => __('Search Resources', 'wp-schedule-manager'),
            'parent_item_colon'     => __('Parent Resources:', 'wp-schedule-manager'),
            'not_found'             => __('No resources found.', 'wp-schedule-manager'),
            'not_found_in_trash'    => __('No resources found in Trash.', 'wp-schedule-manager'),
            'featured_image'        => _x('Resource Image', 'Overrides the "Featured Image" phrase', 'wp-schedule-manager'),
            'set_featured_image'    => _x('Set resource image', 'Overrides the "Set featured image" phrase', 'wp-schedule-manager'),
            'remove_featured_image' => _x('Remove resource image', 'Overrides the "Remove featured image" phrase', 'wp-schedule-manager'),
            'use_featured_image'    => _x('Use as resource image', 'Overrides the "Use as featured image" phrase', 'wp-schedule-manager'),
            'archives'              => _x('Resource archives', 'The post type archive label used in nav menus', 'wp-schedule-manager'),
            'insert_into_item'      => _x('Insert into resource', 'Overrides the "Insert into post" phrase', 'wp-schedule-manager'),
            'uploaded_to_this_item' => _x('Uploaded to this resource', 'Overrides the "Uploaded to this post" phrase', 'wp-schedule-manager'),
            'filter_items_list'     => _x('Filter resources list', 'Screen reader text for the filter links heading on the post type listing screen', 'wp-schedule-manager'),
            'items_list_navigation' => _x('Resources list navigation', 'Screen reader text for the pagination heading on the post type listing screen', 'wp-schedule-manager'),
            'items_list'            => _x('Resources list', 'Screen reader text for the items list heading on the post type listing screen', 'wp-schedule-manager'),
        );
        
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => false, // Hide from main menu, we'll add it to our custom menu
            'query_var'          => true,
            'rewrite'            => array('slug' => 'resource'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'show_in_rest'       => true, // Enable Gutenberg editor
        );
        
        register_post_type('sch_resource', $args);
        
        // Register custom meta fields for resources
        register_post_meta('sch_resource', 'organization_id', array(
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
        ));
    }

    /**
     * Register the organization custom post type.
     *
     * @since    1.0.0
     */
    public function register_organization_post_type() {
        $labels = array(
            'name'                  => _x('Organizations', 'Post type general name', 'wp-schedule-manager'),
            'singular_name'         => _x('Organization', 'Post type singular name', 'wp-schedule-manager'),
            'menu_name'             => _x('Organizations', 'Admin Menu text', 'wp-schedule-manager'),
            'name_admin_bar'        => _x('Organization', 'Add New on Toolbar', 'wp-schedule-manager'),
            'add_new'               => __('Add New', 'wp-schedule-manager'),
            'add_new_item'          => __('Add New Organization', 'wp-schedule-manager'),
            'new_item'              => __('New Organization', 'wp-schedule-manager'),
            'edit_item'             => __('Edit Organization', 'wp-schedule-manager'),
            'view_item'             => __('View Organization', 'wp-schedule-manager'),
            'all_items'             => __('All Organizations', 'wp-schedule-manager'),
            'search_items'          => __('Search Organizations', 'wp-schedule-manager'),
            'parent_item_colon'     => __('Parent Organizations:', 'wp-schedule-manager'),
            'not_found'             => __('No organizations found.', 'wp-schedule-manager'),
            'not_found_in_trash'    => __('No organizations found in Trash.', 'wp-schedule-manager'),
            'featured_image'        => _x('Organization Image', 'Overrides the "Featured Image" phrase', 'wp-schedule-manager'),
            'set_featured_image'    => _x('Set organization image', 'Overrides the "Set featured image" phrase', 'wp-schedule-manager'),
            'remove_featured_image' => _x('Remove organization image', 'Overrides the "Remove featured image" phrase', 'wp-schedule-manager'),
            'use_featured_image'    => _x('Use as organization image', 'Overrides the "Use as featured image" phrase', 'wp-schedule-manager'),
            'archives'              => _x('Organization archives', 'The post type archive label used in nav menus', 'wp-schedule-manager'),
            'insert_into_item'      => _x('Insert into organization', 'Overrides the "Insert into post" phrase', 'wp-schedule-manager'),
            'uploaded_to_this_item' => _x('Uploaded to this organization', 'Overrides the "Uploaded to this post" phrase', 'wp-schedule-manager'),
            'filter_items_list'     => _x('Filter organizations list', 'Screen reader text for the filter links heading on the post type listing screen', 'wp-schedule-manager'),
            'items_list_navigation' => _x('Organizations list navigation', 'Screen reader text for the pagination heading on the post type listing screen', 'wp-schedule-manager'),
            'items_list'            => _x('Organizations list', 'Screen reader text for the items list heading on the post type listing screen', 'wp-schedule-manager'),
        );
        
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => false, // Hide from main menu, we'll add it to our custom menu
            'query_var'          => true,
            'rewrite'            => array('slug' => 'organization'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true, // Allow parent-child relationships
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'show_in_rest'       => true, // Enable Gutenberg editor and REST API
        );
        
        register_post_type('sch_org', $args);
        
        // Register custom meta fields for organizations
        register_post_meta('sch_org', 'parent_id', array(
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
        ));
    }

    /**
     * Display the admin dashboard page.
     *
     * @since    1.0.0
     */
    public function display_admin_dashboard() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="dashboard"></div>';
    }

    /**
     * Display the organizations page.
     *
     * @since    1.0.0
     */
    public function display_organizations_page() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="organizations"></div>';
    }

    /**
     * Display the users page.
     *
     * @since    1.0.0
     */
    public function display_users_page() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="users"></div>';
    }

    /**
     * Display the resources page.
     *
     * @since    1.0.0
     */
    public function display_resources_page() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="resources"></div>';
    }

    /**
     * Display the shifts page.
     *
     * @since    1.0.0
     */
    public function display_shifts_page() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="shifts"></div>';
    }

    /**
     * Display the settings page.
     *
     * @since    1.0.0
     */
    public function display_settings_page() {
        echo '<div id="wp-schedule-manager-admin-app" data-page="settings"></div>';
    }
}
