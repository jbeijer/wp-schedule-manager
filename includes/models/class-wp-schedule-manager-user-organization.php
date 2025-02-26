<?php
/**
 * User Organization model class.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_User_Organization extends WP_Schedule_Manager_Model {

    /**
     * The table name without prefix.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $table_name    The name of the database table.
     */
    protected $table_name = 'schedule_user_organizations';

    /**
     * The fields that can be set during creation or update.
     *
     * @since    1.0.0
     * @access   protected
     * @var      array    $fillable    The fields that can be set.
     */
    protected $fillable = array(
        'user_id',
        'organization_id',
        'role'
    );

    /**
     * Valid roles for users in organizations.
     *
     * @since    1.0.0
     * @access   public
     * @var      array    $valid_roles    The valid roles.
     */
    public $valid_roles = array(
        'base',        // Base user - can view schedules and manage own shifts
        'scheduler',   // Scheduler - can create and manage shifts for others
        'admin'        // Administrator - full access to organization
    );

    /**
     * Get all organizations for a user.
     *
     * @since    1.0.0
     * @param    int       $user_id    The user ID.
     * @return   array                 The organizations for the user.
     */
    public function get_user_organizations($user_id) {
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT uo.*, o.name as organization_name, o.description as organization_description, o.parent_id
                FROM {$this->get_table()} uo
                JOIN {$this->db->prefix}schedule_organizations o ON uo.organization_id = o.id
                WHERE uo.user_id = %d",
                $user_id
            )
        );
    }

    /**
     * Get all users for an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         The users for the organization.
     */
    public function get_organization_users($organization_id) {
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT uo.*, u.display_name, u.user_email
                FROM {$this->get_table()} uo
                JOIN {$this->db->users} u ON uo.user_id = u.ID
                WHERE uo.organization_id = %d",
                $organization_id
            )
        );
    }

    /**
     * Get a user's role in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   string|null                   The user's role or null if not found.
     */
    public function get_user_role($user_id, $organization_id) {
        $result = $this->db->get_var(
            $this->db->prepare(
                "SELECT role FROM {$this->get_table()} WHERE user_id = %d AND organization_id = %d",
                $user_id,
                $organization_id
            )
        );
        
        return $result;
    }

    /**
     * Check if a user has a specific role or higher in an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @param    string    $role              The role to check for.
     * @return   bool                         True if the user has the role or higher, false otherwise.
     */
    public function user_has_role($user_id, $organization_id, $role) {
        $user_role = $this->get_user_role($user_id, $organization_id);
        
        if (!$user_role) {
            return false;
        }
        
        // Define role hierarchy
        $role_hierarchy = array(
            'base' => 1,
            'scheduler' => 2,
            'admin' => 3
        );
        
        // Check if user's role is equal or higher in hierarchy
        return $role_hierarchy[$user_role] >= $role_hierarchy[$role];
    }

    /**
     * Add a user to an organization with a specific role.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @param    string    $role              The role to assign.
     * @return   int|false                    The inserted ID or false on failure.
     */
    public function add_user_to_organization($user_id, $organization_id, $role = 'base') {
        // Validate role
        if (!in_array($role, $this->valid_roles)) {
            return false;
        }
        
        // Check if user already exists in organization
        $existing = $this->db->get_var(
            $this->db->prepare(
                "SELECT id FROM {$this->get_table()} WHERE user_id = %d AND organization_id = %d",
                $user_id,
                $organization_id
            )
        );
        
        if ($existing) {
            // Update role if user already exists
            return $this->update($existing, array('role' => $role));
        } else {
            // Add user to organization
            return $this->create(array(
                'user_id' => $user_id,
                'organization_id' => $organization_id,
                'role' => $role
            ));
        }
    }

    /**
     * Remove a user from an organization.
     *
     * @since    1.0.0
     * @param    int       $user_id           The user ID.
     * @param    int       $organization_id    The organization ID.
     * @return   bool                         True on success, false on failure.
     */
    public function remove_user_from_organization($user_id, $organization_id) {
        return $this->db->delete(
            $this->get_table(),
            array(
                'user_id' => $user_id,
                'organization_id' => $organization_id
            )
        );
    }
}
