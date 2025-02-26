<?php
/**
 * The API functionality of the plugin.
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    WP_Schedule_Manager
 * @subpackage WP_Schedule_Manager/includes
 */

/**
 * The API functionality of the plugin.
 *
 * Defines the plugin name, version, and registers all REST API endpoints.
 *
 * @package    WP_Schedule_Manager
 * @subpackage WP_Schedule_Manager/includes
 * @author     Your Name <email@example.com>
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

if ( ! class_exists( 'WP_REST_Server' ) ) {
    require_once ABSPATH . 'wp-includes/rest-api/class-wp-rest-server.php';
}

if ( ! function_exists( 'register_rest_route' ) ) {
    require_once ABSPATH . 'wp-includes/rest-api.php';
}

class WP_Schedule_Manager_API {

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
    public function __construct( $plugin_name, $version ) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register all REST API routes
     *
     * @since    1.0.0
     */
    public function register_routes() {
        // Directly register API endpoints instead of adding another action
        $this->register_api_endpoints();
    }

    /**
     * Register all API endpoints
     *
     * @since    1.0.0
     */
    public function register_api_endpoints() {
        // API namespace
        $namespace = 'wp-schedule-manager/v1';

        // Register organizations endpoints
        register_rest_route( $namespace, '/organizations', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_organizations' ),
                'permission_callback' => array( $this, 'get_organizations_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_organization' ),
                'permission_callback' => array( $this, 'create_organization_permissions_check' ),
            ),
        ));

        register_rest_route( $namespace, '/organizations/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_organization' ),
                'permission_callback' => array( $this, 'get_organization_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_organization' ),
                'permission_callback' => array( $this, 'update_organization_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_organization' ),
                'permission_callback' => array( $this, 'delete_organization_permissions_check' ),
            ),
        ));

        // Register users-organizations endpoints
        register_rest_route( $namespace, '/users-organizations', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_users_organizations' ),
                'permission_callback' => array( $this, 'get_users_organizations_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_user_organization' ),
                'permission_callback' => array( $this, 'create_user_organization_permissions_check' ),
            ),
        ));

        // Register shifts endpoints
        register_rest_route( $namespace, '/shifts', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_shifts' ),
                'permission_callback' => array( $this, 'get_shifts_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_shift' ),
                'permission_callback' => array( $this, 'create_shift_permissions_check' ),
            ),
        ));

        register_rest_route( $namespace, '/shifts/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_shift' ),
                'permission_callback' => array( $this, 'get_shift_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_shift' ),
                'permission_callback' => array( $this, 'update_shift_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_shift' ),
                'permission_callback' => array( $this, 'delete_shift_permissions_check' ),
            ),
        ));
    }

    /**
     * Get a collection of organizations
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_organizations( $request ) {
        try {
            // Use the Organization model to get all organizations
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-db.php';
            WP_Schedule_Manager_DB::create_tables();
            $organization_model = new WP_Schedule_Manager_Organization();
            
            // Check if we're requesting a hierarchical view
            $hierarchical = isset($request['hierarchical']) ? filter_var($request['hierarchical'], FILTER_VALIDATE_BOOLEAN) : false;
            
            // Check if we're filtering by parent_id
            $parent_id = isset($request['parent_id']) ? intval($request['parent_id']) : null;
            
            if ($hierarchical) {
                // Get organizations in a tree structure
                $organizations_data = $organization_model->get_tree();
                return rest_ensure_response($organizations_data);
            } else if ($parent_id !== null) {
                // Get organizations with the specified parent_id
                $organizations_data = $organization_model->get_children($parent_id);
            } else {
                // Get all organizations
                $organizations_data = $organization_model->all('name', 'ASC');
            }
            
            $organizations = array();
            
            foreach ($organizations_data as $organization) {
                $organizations[] = $this->prepare_organization_for_response($organization);
            }
            
            return rest_ensure_response($organizations);
        } catch (Exception $e) {
            // Log the error
            error_log('Error in get_organizations: ' . $e->getMessage());
            
            // Return error response
            return new WP_Error(
                'rest_organization_error',
                __('Error retrieving organizations: ' . $e->getMessage(), 'wp-schedule-manager'),
                array('status' => 500)
            );
        }
    }

    /**
     * Prepare organization for response
     *
     * @since    1.0.0
     * @param    object $organization The organization object from the database.
     * @return   array                The organization data.
     */
    private function prepare_organization_for_response($organization) {
        return array(
            'id'          => (int) $organization->id,
            'name'        => $organization->name,
            'description' => $organization->description,
            'parent_id'   => $organization->parent_id ? (int) $organization->parent_id : null,
            'created_at'  => $organization->created_at,
            'updated_at'  => $organization->updated_at
        );
    }

    /**
     * Check if a given request has access to get organizations
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_organizations_permissions_check( $request ) {
        $current_user_id = get_current_user_id();
        
        // Användare måste vara inloggad
        if (!$current_user_id) {
            return false;
        }
        
        // Kontrollera om användaren har behörighet att se organisationer
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';
        $permissions = new WP_Schedule_Manager_Permissions();
        return $permissions->user_can_view_organizations();
    }

    /**
     * Get a single organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_organization( $request ) {
        $id = (int) $request['id'];
        
        // Use the Organization model to get the organization
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
        $organization_model = new WP_Schedule_Manager_Organization();
        $organization_data = $organization_model->find($id);
        
        if (!$organization_data) {
            return new WP_Error(
                'rest_organization_invalid_id',
                __('Invalid organization ID.', 'wp-schedule-manager'),
                array('status' => 404)
            );
        }
        
        $organization = $this->prepare_organization_for_response($organization_data);
        
        // Check if we should include hierarchy information
        $include_hierarchy = isset($request['include_hierarchy']) ? filter_var($request['include_hierarchy'], FILTER_VALIDATE_BOOLEAN) : false;
        
        if ($include_hierarchy) {
            // Add ancestors
            $ancestors = $organization_model->get_ancestors($id);
            $organization['ancestors'] = array_map([$this, 'prepare_organization_for_response'], $ancestors);
            
            // Add children
            $children = $organization_model->get_children($id);
            $organization['children'] = array_map([$this, 'prepare_organization_for_response'], $children);
            
            // Add descendants count
            $descendants = $organization_model->get_descendants($id);
            $organization['descendants_count'] = count($descendants);
        }
        
        return rest_ensure_response($organization);
    }

    /**
     * Check if a given request has access to get a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_organization_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }

    /**
     * Create a organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function create_organization( $request ) {
        $organization_data = $this->prepare_item_for_database( $request );
        
        // Debug: Check if we have required data
        if (empty($organization_data['name'])) {
            return new WP_Error('missing_name', 'Organization name is required', array('status' => 400));
        }
        
        // Use the Organization model to create the organization
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
        $organization_model = new WP_Schedule_Manager_Organization();
        
        // Debug: Log the organization data
        error_log('Attempting to create organization with data: ' . print_r($organization_data, true));
        
        $organization_id = $organization_model->create($organization_data);
        
        if (!$organization_id) {
            return new WP_Error('create_failed', 'Could not create organization', array('status' => 500));
        }
        
        // Get the created organization
        $organization = $organization_model->find($organization_id);
        
        if (!$organization) {
            return new WP_Error('not_found', 'Organization not found after creation', array('status' => 500));
        }
        
        $response = rest_ensure_response($organization);
        $response->set_status(201);
        
        return $response;
    }

    /**
     * Check if a given request has access to create organizations
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function create_organization_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }

    /**
     * Update a organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function update_organization( $request ) {
        $id = (int) $request['id'];
        
        // Use the Organization model to find and update the organization
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
        $organization_model = new WP_Schedule_Manager_Organization();
        
        // Check if the organization exists
        $existing_organization = $organization_model->find($id);
        
        if (!$existing_organization) {
            return new WP_Error(
                'rest_organization_invalid_id',
                __('Invalid organization ID.', 'wp-schedule-manager'),
                array('status' => 404)
            );
        }
        
        // Prepare the organization data for update
        $organization_data = $this->prepare_item_for_database($request);
        
        // Update the organization
        $result = $organization_model->update($id, $organization_data);
        
        if (!$result) {
            return new WP_Error(
                'rest_organization_update_failed',
                __('Failed to update organization.', 'wp-schedule-manager'),
                array('status' => 500)
            );
        }
        
        // Get the updated organization
        $updated_organization = $organization_model->find($id);
        
        return rest_ensure_response($updated_organization);
    }

    /**
     * Check if a given request has access to update a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function update_organization_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }

    /**
     * Delete a organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function delete_organization( $request ) {
        $id = (int) $request['id'];
        
        // Use the Organization model to find and delete the organization
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-organization.php';
        $organization_model = new WP_Schedule_Manager_Organization();
        
        // Get the organization before deleting it
        $organization = $organization_model->find($id);
        
        if (!$organization) {
            return new WP_Error(
                'rest_organization_invalid_id',
                __('Invalid organization ID.', 'wp-schedule-manager'),
                array('status' => 404)
            );
        }
        
        $result = $organization_model->delete($id);
        
        if (!$result) {
            return new WP_Error(
                'rest_organization_delete_failed',
                __('Failed to delete organization.', 'wp-schedule-manager'),
                array('status' => 500)
            );
        }
        
        return rest_ensure_response($organization);
    }

    /**
     * Check if a given request has access to delete a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function delete_organization_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }

    /**
     * Get a collection of shifts
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_shifts( $request ) {
        $shift_model = new WP_Schedule_Manager_Shift();
        
        // Handle filters
        $filters = array();
        
        if ( ! empty( $request['organization_id'] ) ) {
            $filters['organization_id'] = (int) $request['organization_id'];
        }
        
        if ( ! empty( $request['user_id'] ) ) {
            $filters['user_id'] = (int) $request['user_id'];
        }
        
        if ( ! empty( $request['start_date'] ) ) {
            $filters['start_date'] = sanitize_text_field( $request['start_date'] );
        }
        
        if ( ! empty( $request['end_date'] ) ) {
            $filters['end_date'] = sanitize_text_field( $request['end_date'] );
        }
        
        if ( ! empty( $request['status'] ) ) {
            $filters['status'] = sanitize_text_field( $request['status'] );
        }
        
        $shifts = $shift_model->get_all( $filters );
        
        return rest_ensure_response( $shifts );
    }

    /**
     * Check if a given request has access to get shifts
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_shifts_permissions_check( $request ) {
        $current_user_id = get_current_user_id();
        
        // Användare måste vara inloggad
        if (!$current_user_id) {
            return false;
        }
        
        // Om organization_id är angivet, kontrollera om användaren kan se scheman för den organisationen
        if (!empty($request['organization_id'])) {
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';
            $permissions = new WP_Schedule_Manager_Permissions();
            return $permissions->can_view_schedule($current_user_id, (int)$request['organization_id']);
        }
        
        // Om ingen organisation är angiven, se om användaren har grundläggande behörighet
        return user_can($current_user_id, 'view_schedule');
    }
    
    /**
     * Get a single shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_shift( $request ) {
        $id = (int) $request['id'];
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->get( $id );
        
        if ( empty( $shift ) ) {
            return new WP_Error( 'rest_shift_invalid_id', __( 'Invalid shift ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        return rest_ensure_response( $shift );
    }

    /**
     * Check if a given request has access to get a specific shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_shift_permissions_check( $request ) {
        $id = (int) $request['id'];
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->get( $id );
        
        if ( empty( $shift ) ) {
            return false;
        }
        
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // Check if user is assigned to this shift
        $current_user_id = get_current_user_id();
        if ( isset( $shift['user_id'] ) && (int) $shift['user_id'] === $current_user_id ) {
            return true; // Users can always view their own shifts
        }
        
        // Check if user can view shifts for this organization
        if ( isset( $shift['organization_id'] ) ) {
            return $permissions->user_can_view_shifts_for_organization( (int) $shift['organization_id'] );
        }
        
        return $permissions->user_can_view_all_shifts();
    }

    /**
     * Create a shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function create_shift( $request ) {
        $shift = $this->prepare_shift_for_database( $request );
        
        $shift_model = new WP_Schedule_Manager_Shift();
        $id = $shift_model->create( $shift );
        
        if ( is_wp_error( $id ) ) {
            return $id;
        }
        
        $shift = $shift_model->get( $id );
        $response = rest_ensure_response( $shift );
        $response->set_status( 201 );
        
        return $response;
    }

    /**
     * Check if a given request has access to create shifts
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function create_shift_permissions_check( $request ) {
        $current_user_id = get_current_user_id();
        
        // Användare måste vara inloggad
        if (!$current_user_id) {
            return false;
        }
        
        // Kontrollera om användaren kan skapa pass i den angivna organisationen
        if (!empty($request['organization_id'])) {
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';
            $permissions = new WP_Schedule_Manager_Permissions();
            return $permissions->can_create_shifts($current_user_id, (int)$request['organization_id']);
        }
        
        return false;
    }

    /**
     * Update a shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function update_shift( $request ) {
        $id = (int) $request['id'];
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->get( $id );
        
        if ( empty( $shift ) ) {
            return new WP_Error( 'rest_shift_invalid_id', __( 'Invalid shift ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        $updated_shift = $this->prepare_shift_for_database( $request );
        $updated_shift['id'] = $id;
        
        $updated = $shift_model->update( $updated_shift );
        
        if ( ! $updated ) {
            return new WP_Error( 'rest_shift_update_failed', __( 'Failed to update shift.', 'wp-schedule-manager' ), array( 'status' => 500 ) );
        }
        
        $shift = $shift_model->get( $id );
        return rest_ensure_response( $shift );
    }

    /**
     * Check if a given request has access to update a specific shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function update_shift_permissions_check( $request ) {
        $current_user_id = get_current_user_id();
        $shift_id = (int)$request['id'];
        
        // Hämta shift-data för att kontrollera organisation
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-shift.php';
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->find($shift_id);
        
        if (!$shift) {
            return false;
        }
        
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-permissions.php';
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // Kontrollera om användaren kan hantera pass i organisationen
        return $permissions->can_edit_shift($current_user_id, $shift);
    }

    /**
     * Delete a shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function delete_shift( $request ) {
        $id = (int) $request['id'];
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->get( $id );
        
        if ( empty( $shift ) ) {
            return new WP_Error( 'rest_shift_invalid_id', __( 'Invalid shift ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        $deleted = $shift_model->delete( $id );
        
        if ( ! $deleted ) {
            return new WP_Error( 'rest_shift_delete_failed', __( 'Failed to delete shift.', 'wp-schedule-manager' ), array( 'status' => 500 ) );
        }
        
        return new WP_REST_Response( null, 204 );
    }

    /**
     * Check if a given request has access to delete a specific shift
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function delete_shift_permissions_check( $request ) {
        $id = (int) $request['id'];
        $shift_model = new WP_Schedule_Manager_Shift();
        $shift = $shift_model->get( $id );
        
        if ( empty( $shift ) ) {
            return false;
        }
        
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // Check if user can delete shifts for this organization
        if ( isset( $shift['organization_id'] ) ) {
            return $permissions->user_can_delete_shifts_for_organization( (int) $shift['organization_id'] );
        }
        
        return $permissions->user_can_delete_all_shifts();
    }

    /**
     * Prepare an organization for database insertion/update
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Request object.
     * @return   array $organization
     */
    public function prepare_item_for_database( $request ) {
        $organization = array();
        
        if ( isset( $request['name'] ) ) {
            $organization['name'] = sanitize_text_field( $request['name'] );
        }
        
        // Initialize description to empty string if not set
        $organization['description'] = '';
        
        if ( isset( $request['description'] ) ) {
            $organization['description'] = sanitize_textarea_field( $request['description'] );
        }
        
        if ( isset( $request['parent_id'] ) && !empty($request['parent_id']) ) {
            $organization['parent_id'] = (int) $request['parent_id'];
        } else {
            $organization['parent_id'] = null;
        }
        
        return $organization;
    }

    /**
     * Prepare a shift for database insertion/update
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Request object.
     * @return   array $shift
     */
    protected function prepare_shift_for_database( $request ) {
        $shift = array();
        
        if ( isset( $request['title'] ) ) {
            $shift['title'] = sanitize_text_field( $request['title'] );
        }
        
        if ( isset( $request['description'] ) ) {
            $shift['description'] = sanitize_textarea_field( $request['description'] );
        }
        
        if ( isset( $request['organization_id'] ) ) {
            $shift['organization_id'] = (int) $request['organization_id'];
        }
        
        if ( isset( $request['user_id'] ) ) {
            $shift['user_id'] = (int) $request['user_id'];
        }
        
        if ( isset( $request['start_time'] ) ) {
            $shift['start_time'] = sanitize_text_field( $request['start_time'] );
        }
        
        if ( isset( $request['end_time'] ) ) {
            $shift['end_time'] = sanitize_text_field( $request['end_time'] );
        }
        
        if ( isset( $request['status'] ) ) {
            $shift['status'] = sanitize_text_field( $request['status'] );
        }
        
        if ( isset( $request['notes'] ) ) {
            $shift['notes'] = sanitize_textarea_field( $request['notes'] );
        }
        
        if ( isset( $request['resource_id'] ) ) {
            $shift['resource_id'] = (int) $request['resource_id'];
        }
        
        return $shift;
    }

    /**
     * Prepare a user-organization relationship for database insertion/update
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Request object.
     * @return   array $user_organization
     */
    protected function prepare_user_organization_for_database( $request ) {
        $user_organization = array();
        
        if ( isset( $request['user_id'] ) ) {
            $user_organization['user_id'] = (int) $request['user_id'];
        }
        
        if ( isset( $request['organization_id'] ) ) {
            $user_organization['organization_id'] = (int) $request['organization_id'];
        }
        
        if ( isset( $request['role'] ) ) {
            $user_organization['role'] = sanitize_text_field( $request['role'] );
        }
        
        if ( isset( $request['status'] ) ) {
            $user_organization['status'] = sanitize_text_field( $request['status'] );
        }
        
        return $user_organization;
    }

    /**
     * Get users-organizations relationships
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_users_organizations( $request ) {
        $user_organization_model = new WP_Schedule_Manager_User_Organization();
        
        // Handle filters
        $filters = array();
        
        if ( ! empty( $request['organization_id'] ) ) {
            $filters['organization_id'] = (int) $request['organization_id'];
        }
        
        if ( ! empty( $request['user_id'] ) ) {
            $filters['user_id'] = (int) $request['user_id'];
        }
        
        if ( ! empty( $request['role'] ) ) {
            $filters['role'] = sanitize_text_field( $request['role'] );
        }
        
        $users_organizations = $user_organization_model->get_all( $filters );
        
        return rest_ensure_response( $users_organizations );
    }

    /**
     * Check if a given request has access to get users-organizations
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_users_organizations_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }

    /**
     * Create a user-organization relationship
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function create_user_organization( $request ) {
        $user_organization = $this->prepare_user_organization_for_database( $request );
        
        $user_organization_model = new WP_Schedule_Manager_User_Organization();
        $id = $user_organization_model->create( $user_organization );
        
        if ( is_wp_error( $id ) ) {
            return $id;
        }
        
        $user_organization = $user_organization_model->get( $id );
        $response = rest_ensure_response( $user_organization );
        $response->set_status( 201 );
        
        return $response;
    }

    /**
     * Check if a given request has access to create user-organization relationships
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function create_user_organization_permissions_check( $request ) {
        // For testing purposes, allow all requests
        return true;
    }
}
