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
        $organization_model = new WP_Schedule_Manager_Organization();
        $organizations = $organization_model->get_all();
        
        return rest_ensure_response( $organizations );
    }

    /**
     * Check if a given request has access to get organizations
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_organizations_permissions_check( $request ) {
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
        $organization_model = new WP_Schedule_Manager_Organization();
        $organization = $organization_model->get( $id );
        
        if ( empty( $organization ) ) {
            return new WP_Error( 'rest_organization_invalid_id', __( 'Invalid organization ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        return rest_ensure_response( $organization );
    }

    /**
     * Check if a given request has access to get a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function get_organization_permissions_check( $request ) {
        $id = (int) $request['id'];
        $permissions = new WP_Schedule_Manager_Permissions();
        return $permissions->user_can_view_organization( $id );
    }

    /**
     * Create a organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   WP_REST_Response
     */
    public function create_organization( $request ) {
        $organization = $this->prepare_item_for_database( $request );
        
        $organization_model = new WP_Schedule_Manager_Organization();
        $id = $organization_model->create( $organization );
        
        if ( is_wp_error( $id ) ) {
            return $id;
        }
        
        $organization = $organization_model->get( $id );
        $response = rest_ensure_response( $organization );
        $response->set_status( 201 );
        
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
        $permissions = new WP_Schedule_Manager_Permissions();
        return $permissions->user_can_create_organization();
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
        $organization_model = new WP_Schedule_Manager_Organization();
        $organization = $organization_model->get( $id );
        
        if ( empty( $organization ) ) {
            return new WP_Error( 'rest_organization_invalid_id', __( 'Invalid organization ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        $organization = $this->prepare_item_for_database( $request );
        $organization['id'] = $id;
        
        $updated = $organization_model->update( $organization );
        
        if ( ! $updated ) {
            return new WP_Error( 'rest_organization_update_failed', __( 'Failed to update organization.', 'wp-schedule-manager' ), array( 'status' => 500 ) );
        }
        
        $organization = $organization_model->get( $id );
        return rest_ensure_response( $organization );
    }

    /**
     * Check if a given request has access to update a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function update_organization_permissions_check( $request ) {
        $id = (int) $request['id'];
        $permissions = new WP_Schedule_Manager_Permissions();
        return $permissions->user_can_edit_organization( $id );
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
        $organization_model = new WP_Schedule_Manager_Organization();
        $organization = $organization_model->get( $id );
        
        if ( empty( $organization ) ) {
            return new WP_Error( 'rest_organization_invalid_id', __( 'Invalid organization ID.', 'wp-schedule-manager' ), array( 'status' => 404 ) );
        }
        
        $deleted = $organization_model->delete( $id );
        
        if ( ! $deleted ) {
            return new WP_Error( 'rest_organization_delete_failed', __( 'Failed to delete organization.', 'wp-schedule-manager' ), array( 'status' => 500 ) );
        }
        
        return new WP_REST_Response( null, 204 );
    }

    /**
     * Check if a given request has access to delete a specific organization
     *
     * @since    1.0.0
     * @param    WP_REST_Request $request Full data about the request.
     * @return   bool
     */
    public function delete_organization_permissions_check( $request ) {
        $id = (int) $request['id'];
        $permissions = new WP_Schedule_Manager_Permissions();
        return $permissions->user_can_delete_organization( $id );
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
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // If organization_id is provided, check if user can view shifts for that organization
        if ( ! empty( $request['organization_id'] ) ) {
            return $permissions->user_can_view_shifts_for_organization( (int) $request['organization_id'] );
        }
        
        // If user_id is provided, check if the current user is requesting their own shifts or has permission
        if ( ! empty( $request['user_id'] ) ) {
            $user_id = (int) $request['user_id'];
            $current_user_id = get_current_user_id();
            
            if ( $user_id === $current_user_id ) {
                return true; // Users can always view their own shifts
            }
            
            return $permissions->user_can_view_shifts_for_user( $user_id );
        }
        
        // Default permission check for viewing all shifts
        return $permissions->user_can_view_all_shifts();
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
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // If organization_id is provided, check if user can create shifts for that organization
        if ( ! empty( $request['organization_id'] ) ) {
            return $permissions->user_can_create_shifts_for_organization( (int) $request['organization_id'] );
        }
        
        return $permissions->user_can_create_shifts();
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
            // Users can update their own shifts but only certain fields
            // This would need more complex logic in a real implementation
            return true;
        }
        
        // Check if user can edit shifts for this organization
        if ( isset( $shift['organization_id'] ) ) {
            return $permissions->user_can_edit_shifts_for_organization( (int) $shift['organization_id'] );
        }
        
        return $permissions->user_can_edit_all_shifts();
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
    protected function prepare_item_for_database( $request ) {
        $organization = array();
        
        if ( isset( $request['name'] ) ) {
            $organization['name'] = sanitize_text_field( $request['name'] );
        }
        
        if ( isset( $request['description'] ) ) {
            $organization['description'] = sanitize_textarea_field( $request['description'] );
        }
        
        if ( isset( $request['parent_id'] ) ) {
            $organization['parent_id'] = (int) $request['parent_id'];
        }
        
        if ( isset( $request['status'] ) ) {
            $organization['status'] = sanitize_text_field( $request['status'] );
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
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // If organization_id is provided, check if user can view users for that organization
        if ( ! empty( $request['organization_id'] ) ) {
            return $permissions->user_can_view_users_for_organization( (int) $request['organization_id'] );
        }
        
        // If user_id is provided, check if the current user is requesting their own organizations or has permission
        if ( ! empty( $request['user_id'] ) ) {
            $user_id = (int) $request['user_id'];
            $current_user_id = get_current_user_id();
            
            if ( $user_id === $current_user_id ) {
                return true; // Users can always view their own organizations
            }
            
            return $permissions->user_can_view_organizations_for_user( $user_id );
        }
        
        // Default permission check for viewing all user-organization relationships
        return $permissions->user_can_view_all_users_organizations();
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
        $permissions = new WP_Schedule_Manager_Permissions();
        
        // If organization_id is provided, check if user can add users to that organization
        if ( ! empty( $request['organization_id'] ) ) {
            return $permissions->user_can_add_users_to_organization( (int) $request['organization_id'] );
        }
        
        return $permissions->user_can_manage_users_organizations();
    }
}
