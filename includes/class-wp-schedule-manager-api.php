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

        // Register users endpoints
        register_rest_route( $namespace, '/users', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_users' ),
                'permission_callback' => array( $this, 'get_users_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_user' ),
                'permission_callback' => array( $this, 'create_user_permissions_check' ),
            ),
        ));

        register_rest_route( $namespace, '/users/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_user' ),
                'permission_callback' => array( $this, 'get_user_permissions_check' ),
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_user' ),
                'permission_callback' => array( $this, 'update_user_permissions_check' ),
                'args'                => array(
                    'role' => array(
                        'required'          => false,
                        'validate_callback' => function($param) {
                            return in_array($param, ['bas', 'schemaläggare', 'admin']);
                        }
                    )
                )
            ),
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_user' ),
                'permission_callback' => array( $this, 'delete_user_permissions_check' ),
            ),
        ));

        register_rest_route( $namespace, '/users/(?P<id>\d+)/permissions', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_user_permissions' ),
                'permission_callback' => array( $this, 'get_user_permissions_check' ),
            ),
        ));

        // Add role update endpoint
        register_rest_route($namespace, '/users/(?P<id>\d+)/role', array(
            array(
                'methods' => 'PUT',
                'callback' => array($this, 'update_user_role'),
                'permission_callback' => array($this, 'update_user_permissions_check'),
                'args' => array(
                    'role' => array(
                        'required' => true,
                        'validate_callback' => function($param) {
                            return in_array($param, ['bas', 'schemaläggare', 'admin']);
                        }
                    )
                )
            )
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
            return $permissions->user_can_view_organizations();
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
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'models/class-wp-schedule-manager-shift.php';
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

    /**
     * Get users
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function get_users( $request ) {
        // Get WordPress users
        $args = array(
            'orderby' => 'display_name',
            'order'   => 'ASC',
        );
        
        // Add filters if provided
        if ( isset( $request['role'] ) ) {
            $args['role'] = sanitize_text_field( $request['role'] );
        }
        
        $users = get_users( $args );
        $response = array();
        
        // Get the User Organization instance
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-user-organization.php';
        $user_org = new WP_Schedule_Manager_User_Organization();
        
        foreach ( $users as $user ) {
            // Get user organizations and roles
            $user_orgs = $user_org->get_user_organizations( $user->ID );
            
            // Get the highest role across all organizations
            $highest_role = 'member'; // Default
            
            foreach ( $user_orgs as $org ) {
                if ( $org->role === 'admin' ) {
                    $highest_role = 'admin';
                    break;
                } elseif ( $org->role === 'manager' && $highest_role !== 'admin' ) {
                    $highest_role = 'manager';
                }
            }
            
            // Add user to response
            $response[] = array(
                'id'           => $user->ID,
                'user_login'   => $user->user_login,
                'display_name' => $user->display_name,
                'user_email'   => $user->user_email,
                'role'         => $highest_role,
                'organizations' => count($user_orgs),
            );
        }
        
        return rest_ensure_response( $response );
    }

    /**
     * Check if a given request has access to get users
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool
     */
    public function get_users_permissions_check( $request ) {
        // Allow any logged-in user to view the user list
        // You can make this more restrictive later if needed
        return is_user_logged_in();
    }

    /**
     * Get a single user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function get_user( $request ) {
        $user_id = (int) $request['id'];
        $user = get_user_by('id', $user_id);

        if (!$user) {
            return new WP_Error(
                'rest_user_invalid_id',
                __('Invalid user ID.', 'wp-schedule-manager'),
                array('status' => 404)
            );
        }

        // Get plugin role
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-role.php';
        $plugin_role = WP_Schedule_Manager_Role::get_user_role($user_id);

        $response = array(
            'id'           => $user->ID,
            'user_login'   => $user->user_login,
            'display_name' => $user->display_name,
            'user_email'   => $user->user_email,
            'role'         => $plugin_role,
            'wp_role'      => $user->roles[0]
        );

        return rest_ensure_response($response);
    }

    /**
     * Check if a given request has access to get a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool
     */
    public function get_user_permissions_check( $request ) {
        // Allow any logged-in user to view user details
        // You can make this more restrictive later if needed
        return is_user_logged_in();
    }

    /**
     * Create a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function create_user($request) {
        // Verify permissions
        if (!current_user_can('create_users')) {
            return new WP_Error(
                'rest_forbidden',
                __('Du har inte behörighet att skapa användare'),
                array('status' => 403)
            );
        }

        $user_data = $request->get_params();

        // Validate required fields
        if (empty($user_data['first_name']) || empty($user_data['last_name']) || empty($user_data['user_email'])) {
            return new WP_Error(
                'missing_fields',
                __('Förnamn, efternamn och e-post måste anges'),
                array('status' => 400)
            );
        }

        // Validate email
        if (!is_email($user_data['user_email'])) {
            return new WP_Error(
                'invalid_email',
                __('Ange en giltig e-postadress'),
                array('status' => 400)
            );
        }

        // Create WordPress user
        $user_id = wp_insert_user(array(
            'user_login' => sanitize_user($user_data['user_email']),
            'user_email' => sanitize_email($user_data['user_email']),
            'first_name' => sanitize_text_field($user_data['first_name']),
            'last_name' => sanitize_text_field($user_data['last_name']),
            'display_name' => sanitize_text_field($user_data['display_name'] ?? ''),
            'role' => 'subscriber', // Default WordPress role
            'user_pass' => wp_generate_password()
        ));

        if (is_wp_error($user_id)) {
            return new WP_Error(
                'user_creation_failed',
                $user_id->get_error_message(),
                array('status' => 400)
            );
        }

        // Set custom role if specified
        if (!empty($user_data['role'])) {
            require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-role.php';
            WP_Schedule_Manager_Role::set_user_role($user_id, sanitize_text_field($user_data['role']));
        }

        // Send notification email
        wp_new_user_notification($user_id, null, 'user');

        // Return created user
        $response = $this->get_user(new WP_REST_Request('GET', '/wp-schedule-manager/v1/users/' . $user_id));
        $response->set_status(201);
        return $response;
    }

    /**
     * Check if a given request has access to create users
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool
     */
    public function create_user_permissions_check( $request ) {
        $current_user = wp_get_current_user();
        
        // Admin can create any user
        if (current_user_can('manage_options')) {
            return true;
        }
        
        // Schemaläggare can only create Bas users
        if (in_array('schemaläggare', $current_user->roles)) {
            $target_role = $request->get_param('role');
            return $target_role === 'bas';
        }
        
        return false;
    }

    /**
     * Update a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function update_user($request) {
        $user_id = (int)$request['id'];
        
        // Add debugging
        error_log('Update user API - User ID: ' . $user_id);
        error_log('Update user API - Request params: ' . print_r($request->get_params(), true));
        
        $user_data = $this->prepare_user_for_database($request);

        // Update WordPress user data (excluding role)
        $wp_user_data = array(
            'ID' => $user_id,
            'first_name' => $user_data['first_name'],
            'last_name' => $user_data['last_name'],
            'display_name' => $user_data['display_name'],
        );

        // Only update email if it's changed
        if (isset($user_data['user_email'])) {
            $wp_user_data['user_email'] = $user_data['user_email'];
        }

        // Update the WordPress user
        $updated = wp_update_user($wp_user_data);

        if (is_wp_error($updated)) {
            return $updated;
        }

        // Handle plugin-specific role in custom table
        if (isset($user_data['role']) && !empty($user_data['role'])) {
            global $wpdb;
            $table_name = $wpdb->prefix . 'schedule_user_roles';
            
            // Check if role exists for user
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table_name WHERE user_id = %d",
                $user_id
            ));
            
            if ($exists) {
                // Update existing role
                $wpdb->update(
                    $table_name,
                    array('role' => $user_data['role']),
                    array('user_id' => $user_id)
                );
            } else {
                // Insert new role
                $wpdb->insert(
                    $table_name,
                    array(
                        'user_id' => $user_id,
                        'role' => $user_data['role']
                    )
                );
            }
        }

        // Return the updated user
        return $this->get_user(new WP_REST_Request('GET', '/wp-schedule-manager/v1/users/' . $user_id));
    }

    /**
     * Check if a given request has access to update a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool
     */
    public function update_user_permissions_check( $request ) {
        // Allow administrators to update users
        return current_user_can( 'manage_options' ) || current_user_can( 'administrator' );
    }

    /**
     * Delete a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_REST_Response
     */
    public function delete_user( $request ) {
        $user_id = (int)$request['id'];
        $user = get_user_by('ID', $user_id);

        if (!$user) {
            return new WP_Error(
                'invalid_user_id',
                __('Invalid user ID.', 'wp-schedule-manager'),
                array('status' => 404)
            );
        }

        // Get user data before deletion for the response
        $response = array(
            'id'           => $user->ID,
            'user_login'   => $user->user_login,
            'display_name' => $user->display_name,
            'user_email'   => $user->user_email,
        );

        // Delete the user
        $result = wp_delete_user($user_id);

        if (!$result) {
            return new WP_Error(
                'user_delete_failed',
                __('Failed to delete user.', 'wp-schedule-manager'),
                array('status' => 500)
            );
        }

        // Clean up user-organization relationships
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-user-organization.php';
        $user_org = new WP_Schedule_Manager_User_Organization();
        $user_org->delete_user_relationships($user_id);

        return rest_ensure_response($response);
    }

    /**
     * Check if a given request has access to delete a user
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return bool
     */
    public function delete_user_permissions_check( $request ) {
        // Allow administrators to delete users
        return current_user_can( 'manage_options' ) || current_user_can( 'administrator' );
    }

    /**
     * Prepare a user for database insertion/update
     *
     * @param WP_REST_Request $request Request object.
     * @return array $user
     */
    protected function prepare_user_for_database( $request ) {
        $user = array();

        // Get the user ID from the request
        if (isset($request['id'])) {
            $user['ID'] = (int)$request['id'];
        }

        if (isset($request['first_name'])) {
            $first_name = sanitize_text_field($request['first_name']);
            if (!empty($first_name)) {
                $user['first_name'] = $first_name;
            }
        }

        if (isset($request['last_name'])) {
            $last_name = sanitize_text_field($request['last_name']);
            if (!empty($last_name)) {
                $user['last_name'] = $last_name;
            }
        }

        if (isset($request['display_name'])) {
            $display_name = sanitize_text_field($request['display_name']);
            if (!empty($display_name)) {
                $user['display_name'] = $display_name;
            }
        }

        if (isset($request['user_email'])) {
            $user['user_email'] = sanitize_email($request['user_email']);
        }

        if (isset($request['role'])) {
            $user['role'] = sanitize_text_field($request['role']);
        }

        return $user;
    }

    /**
     * Get user permissions
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function get_user_permissions($request) {
        $user_id = $request->get_param('user_id');
        $user_orgs = $this->get_user_organizations($user_id);

        $response = array(
            'organizations' => count($user_orgs),
        );

        return rest_ensure_response($response);
    }

    /**
     * Get user organizations
     *
     * @since    1.0.0
     * @param    int $user_id The ID of the user.
     * @return   array
     */
    private function get_user_organizations($user_id) {
        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/models/class-wp-schedule-manager-user-organization.php';
        $user_org = new WP_Schedule_Manager_User_Organization();
        return $user_org->get_user_organizations($user_id);
    }

    /**
     * Update a user's role
     */
    public function update_user_role($request) {
        $user_id = (int)$request['id'];
        $role = $request['role'];

        require_once WP_SCHEDULE_MANAGER_PLUGIN_DIR . 'includes/class-wp-schedule-manager-role.php';
        $result = WP_Schedule_Manager_Role::set_user_role($user_id, $role);

        if ($result === false) {
            return new WP_Error(
                'rest_role_update_failed',
                __('Failed to update user role.', 'wp-schedule-manager'),
                array('status' => 500)
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'user_id' => $user_id,
                'role' => $role
            )
        ));
    }
}
