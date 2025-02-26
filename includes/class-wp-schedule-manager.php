<?php
/**
 * The main plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager {

    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      WP_Schedule_Manager_Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $plugin_name    The string used to uniquely identify this plugin.
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $version    The current version of the plugin.
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * @since    1.0.0
     */
    public function __construct() {
        $this->plugin_name = 'wp-schedule-manager';
        $this->version = '1.0.0';
        
        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_api_hooks();
    }

    /**
     * Load the required dependencies for this plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_dependencies() {
        // The class responsible for orchestrating the actions and filters of the core plugin.
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-loader.php';

        // The class responsible for defining internationalization functionality of the plugin.
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-i18n.php';

        // The class responsible for defining all actions that occur in the admin area.
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'admin/class-wp-schedule-manager-admin.php';

        // The class responsible for defining all actions that occur in the public-facing side of the site.
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'public/class-wp-schedule-manager-public.php';

        // The class responsible for defining all database operations
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';

        // The class responsible for defining all API endpoints
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-api.php';

        // Load model classes
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-model.php';
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-user-organization.php';
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-shift.php';

        // Load permission class
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';

        $this->loader = new WP_Schedule_Manager_Loader();
    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * @since    1.0.0
     * @access   private
     */
    private function set_locale() {
        $plugin_i18n = new WP_Schedule_Manager_i18n();
        $this->loader->add_action('plugins_loaded', $plugin_i18n, 'load_plugin_textdomain');
    }

    /**
     * Register all of the hooks related to the admin area functionality of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_admin_hooks() {
        $plugin_admin = new WP_Schedule_Manager_Admin($this->plugin_name, $this->version);
        
        // Admin menu and pages
        $this->loader->add_action('admin_menu', $plugin_admin, 'add_admin_menu');
        
        // Admin scripts and styles
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
        
        // Register custom post type for resources
        $this->loader->add_action('init', $plugin_admin, 'register_resource_post_type');
        
        // Register custom post type for organizations
        $this->loader->add_action('init', $plugin_admin, 'register_organization_post_type');
    }

    /**
     * Register all of the hooks related to the public-facing functionality of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_public_hooks() {
        $plugin_public = new WP_Schedule_Manager_Public($this->plugin_name, $this->version);
        
        // Public scripts and styles
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $plugin_public, 'enqueue_scripts');
        
        // Register shortcodes
        $this->loader->add_action('init', $plugin_public, 'register_shortcodes');
    }

    /**
     * Register all of the hooks related to the API functionality of the plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_api_hooks() {
        $plugin_api = new WP_Schedule_Manager_API($this->plugin_name, $this->version);
        
        // Register API endpoints
        $this->loader->add_action('rest_api_init', $plugin_api, 'register_routes');
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @since    1.0.0
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Activate the plugin.
     *
     * @since    1.0.0
     */
    public static function activate() {
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';
        WP_Schedule_Manager_DB::create_tables();
        
        // Create default roles and capabilities
        self::create_roles_and_capabilities();
        
        // Run migration to update organization paths
        self::run_migrations();
        
        // Flush rewrite rules for custom post types
        flush_rewrite_rules();
    }

    /**
     * Deactivate the plugin.
     *
     * @since    1.0.0
     */
    public static function deactivate() {
        // Flush rewrite rules for custom post types
        flush_rewrite_rules();
    }

    /**
     * Create roles and capabilities for the plugin.
     *
     * @since    1.0.0
     */
    private static function create_roles_and_capabilities() {
        // Implementation will be added later
    }
    
    /**
     * Run plugin migrations.
     *
     * @since    1.0.0
     */
    private static function run_migrations() {
        // Run organization paths migration
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/migrations/update-organization-paths.php';
    }
}
