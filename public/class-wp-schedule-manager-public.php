<?php
/**
 * The public-facing functionality of the plugin.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Public {

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
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            'wp-schedule-manager-public',
            WP_SCHEDULE_MANAGER_PLUGIN_URL . 'public/css/wp-schedule-manager-public.css',
            array(),
            $this->version
        );
    }

    /**
     * Register the JavaScript for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'wp-schedule-manager-public',
            WP_SCHEDULE_MANAGER_PLUGIN_URL . 'public/js/build/wp-schedule-manager-public.js',
            array('jquery'),
            $this->version,
            true
        );
        
        // Localize the script with data
        wp_localize_script(
            'wp-schedule-manager-public',
            'wpScheduleManager',
            array(
                'apiUrl' => esc_url_raw(rest_url('wp-schedule-manager/v1')),
                'nonce' => wp_create_nonce('wp_rest'),
                'userId' => get_current_user_id(),
            )
        );
    }

    /**
     * Register shortcodes.
     *
     * @since    1.0.0
     */
    public function register_shortcodes() {
        add_shortcode('schedule_calendar', array($this, 'schedule_calendar_shortcode'));
        add_shortcode('my_schedule', array($this, 'my_schedule_shortcode'));
        add_shortcode('organization_schedule', array($this, 'organization_schedule_shortcode'));
    }

    /**
     * Shortcode for displaying the schedule calendar.
     *
     * @since    1.0.0
     * @param    array     $atts    Shortcode attributes.
     * @return   string             Shortcode output.
     */
    public function schedule_calendar_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'organization_id' => 0,
                'view' => 'month', // month, week, day
            ),
            $atts,
            'schedule_calendar'
        );
        
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<p>' . __('Please log in to view the schedule.', 'wp-schedule-manager') . '</p>';
        }
        
        ob_start();
        ?>
        <div id="wp-schedule-manager-public-app" 
             data-page="calendar" 
             data-organization-id="<?php echo esc_attr($atts['organization_id']); ?>"
             data-view="<?php echo esc_attr($atts['view']); ?>">
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Shortcode for displaying the current user's schedule.
     *
     * @since    1.0.0
     * @param    array     $atts    Shortcode attributes.
     * @return   string             Shortcode output.
     */
    public function my_schedule_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'view' => 'list', // list, calendar
            ),
            $atts,
            'my_schedule'
        );
        
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<p>' . __('Please log in to view your schedule.', 'wp-schedule-manager') . '</p>';
        }
        
        ob_start();
        ?>
        <div id="wp-schedule-manager-public-app" 
             data-page="my-schedule" 
             data-view="<?php echo esc_attr($atts['view']); ?>">
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Shortcode for displaying an organization's schedule.
     *
     * @since    1.0.0
     * @param    array     $atts    Shortcode attributes.
     * @return   string             Shortcode output.
     */
    public function organization_schedule_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'organization_id' => 0,
                'view' => 'calendar', // calendar, list
            ),
            $atts,
            'organization_schedule'
        );
        
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<p>' . __('Please log in to view the organization schedule.', 'wp-schedule-manager') . '</p>';
        }
        
        // Check if organization_id is provided
        if (empty($atts['organization_id'])) {
            return '<p>' . __('Organization ID is required.', 'wp-schedule-manager') . '</p>';
        }
        
        ob_start();
        ?>
        <div id="wp-schedule-manager-public-app" 
             data-page="organization-schedule" 
             data-organization-id="<?php echo esc_attr($atts['organization_id']); ?>"
             data-view="<?php echo esc_attr($atts['view']); ?>">
        </div>
        <?php
        return ob_get_clean();
    }
}
