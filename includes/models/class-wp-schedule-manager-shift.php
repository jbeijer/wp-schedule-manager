<?php
/**
 * Shift model class.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Shift extends WP_Schedule_Manager_Model {

    /**
     * The table name without prefix.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $table_name    The name of the database table.
     */
    protected $table_name = 'schedule_shifts';

    /**
     * The fields that can be set during creation or update.
     *
     * @since    1.0.0
     * @access   protected
     * @var      array    $fillable    The fields that can be set.
     */
    protected $fillable = array(
        'organization_id',
        'resource_id',
        'user_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'status',
        'created_by'
    );

    /**
     * Valid statuses for shifts.
     *
     * @since    1.0.0
     * @access   public
     * @var      array    $valid_statuses    The valid statuses.
     */
    public $valid_statuses = array(
        'open',     // Open shift, not assigned to a user
        'assigned', // Assigned to a user
        'completed', // Shift has been completed
        'cancelled' // Shift has been cancelled
    );

    /**
     * Get shifts for an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @param    string    $status             Optional. Filter by status.
     * @param    string    $start_date         Optional. Filter by start date (Y-m-d).
     * @param    string    $end_date           Optional. Filter by end date (Y-m-d).
     * @return   array                         The shifts for the organization.
     */
    public function get_organization_shifts($organization_id, $status = null, $start_date = null, $end_date = null) {
        $query = "SELECT s.*, 
                  u.display_name as user_name, 
                  c.display_name as creator_name,
                  r.post_title as resource_name
                  FROM {$this->get_table()} s
                  LEFT JOIN {$this->db->users} u ON s.user_id = u.ID
                  LEFT JOIN {$this->db->users} c ON s.created_by = c.ID
                  LEFT JOIN {$this->db->posts} r ON s.resource_id = r.ID
                  WHERE s.organization_id = %d";
        
        $params = array($organization_id);
        
        if ($status) {
            $query .= " AND s.status = %s";
            $params[] = $status;
        }
        
        if ($start_date) {
            $query .= " AND DATE(s.start_time) >= %s";
            $params[] = $start_date;
        }
        
        if ($end_date) {
            $query .= " AND DATE(s.end_time) <= %s";
            $params[] = $end_date;
        }
        
        $query .= " ORDER BY s.start_time ASC";
        
        return $this->db->get_results(
            $this->db->prepare($query, $params)
        );
    }

    /**
     * Get shifts for a user.
     *
     * @since    1.0.0
     * @param    int       $user_id            The user ID.
     * @param    string    $status             Optional. Filter by status.
     * @param    string    $start_date         Optional. Filter by start date (Y-m-d).
     * @param    string    $end_date           Optional. Filter by end date (Y-m-d).
     * @return   array                         The shifts for the user.
     */
    public function get_user_shifts($user_id, $status = null, $start_date = null, $end_date = null) {
        $query = "SELECT s.*, 
                  o.name as organization_name,
                  r.post_title as resource_name
                  FROM {$this->get_table()} s
                  JOIN {$this->db->prefix}schedule_organizations o ON s.organization_id = o.id
                  LEFT JOIN {$this->db->posts} r ON s.resource_id = r.ID
                  WHERE s.user_id = %d";
        
        $params = array($user_id);
        
        if ($status) {
            $query .= " AND s.status = %s";
            $params[] = $status;
        }
        
        if ($start_date) {
            $query .= " AND DATE(s.start_time) >= %s";
            $params[] = $start_date;
        }
        
        if ($end_date) {
            $query .= " AND DATE(s.end_time) <= %s";
            $params[] = $end_date;
        }
        
        $query .= " ORDER BY s.start_time ASC";
        
        return $this->db->get_results(
            $this->db->prepare($query, $params)
        );
    }

    /**
     * Get shifts for a resource.
     *
     * @since    1.0.0
     * @param    int       $resource_id        The resource ID.
     * @param    string    $status             Optional. Filter by status.
     * @param    string    $start_date         Optional. Filter by start date (Y-m-d).
     * @param    string    $end_date           Optional. Filter by end date (Y-m-d).
     * @return   array                         The shifts for the resource.
     */
    public function get_resource_shifts($resource_id, $status = null, $start_date = null, $end_date = null) {
        $query = "SELECT s.*, 
                  o.name as organization_name,
                  u.display_name as user_name
                  FROM {$this->get_table()} s
                  JOIN {$this->db->prefix}schedule_organizations o ON s.organization_id = o.id
                  LEFT JOIN {$this->db->users} u ON s.user_id = u.ID
                  WHERE s.resource_id = %d";
        
        $params = array($resource_id);
        
        if ($status) {
            $query .= " AND s.status = %s";
            $params[] = $status;
        }
        
        if ($start_date) {
            $query .= " AND DATE(s.start_time) >= %s";
            $params[] = $start_date;
        }
        
        if ($end_date) {
            $query .= " AND DATE(s.end_time) <= %s";
            $params[] = $end_date;
        }
        
        $query .= " ORDER BY s.start_time ASC";
        
        return $this->db->get_results(
            $this->db->prepare($query, $params)
        );
    }

    /**
     * Assign a shift to a user.
     *
     * @since    1.0.0
     * @param    int       $shift_id    The shift ID.
     * @param    int       $user_id     The user ID.
     * @return   bool                   True on success, false on failure.
     */
    public function assign_shift($shift_id, $user_id) {
        return $this->update($shift_id, array(
            'user_id' => $user_id,
            'status' => 'assigned'
        ));
    }

    /**
     * Unassign a shift from a user.
     *
     * @since    1.0.0
     * @param    int       $shift_id    The shift ID.
     * @return   bool                   True on success, false on failure.
     */
    public function unassign_shift($shift_id) {
        return $this->update($shift_id, array(
            'user_id' => null,
            'status' => 'open'
        ));
    }

    /**
     * Mark a shift as completed.
     *
     * @since    1.0.0
     * @param    int       $shift_id    The shift ID.
     * @return   bool                   True on success, false on failure.
     */
    public function complete_shift($shift_id) {
        return $this->update($shift_id, array(
            'status' => 'completed'
        ));
    }

    /**
     * Cancel a shift.
     *
     * @since    1.0.0
     * @param    int       $shift_id    The shift ID.
     * @return   bool                   True on success, false on failure.
     */
    public function cancel_shift($shift_id) {
        return $this->update($shift_id, array(
            'status' => 'cancelled'
        ));
    }

    /**
     * Check if a time slot is available for a resource.
     *
     * @since    1.0.0
     * @param    int       $resource_id    The resource ID.
     * @param    string    $start_time     The start time (Y-m-d H:i:s).
     * @param    string    $end_time       The end time (Y-m-d H:i:s).
     * @param    int       $exclude_shift  Optional. Shift ID to exclude from check.
     * @return   bool                      True if available, false if not.
     */
    public function is_time_slot_available($resource_id, $start_time, $end_time, $exclude_shift = null) {
        $query = "SELECT COUNT(*) FROM {$this->get_table()} 
                  WHERE resource_id = %d 
                  AND status IN ('open', 'assigned') 
                  AND (
                      (start_time <= %s AND end_time > %s) OR
                      (start_time < %s AND end_time >= %s) OR
                      (start_time >= %s AND end_time <= %s)
                  )";
        
        $params = array(
            $resource_id,
            $end_time,
            $start_time,
            $end_time,
            $start_time,
            $start_time,
            $end_time
        );
        
        if ($exclude_shift) {
            $query .= " AND id != %d";
            $params[] = $exclude_shift;
        }
        
        $count = $this->db->get_var(
            $this->db->prepare($query, $params)
        );
        
        return $count == 0;
    }

    /**
     * Validate shift times.
     *
     * @since    1.0.0
     * @param    string    $start_time    The start time (Y-m-d H:i:s).
     * @param    string    $end_time      The end time (Y-m-d H:i:s).
     * @return   bool                     True if valid, false if not.
     */
    public function validate_shift_times($start_time, $end_time) {
        // Start time must be before end time
        if (strtotime($start_time) >= strtotime($end_time)) {
            return false;
        }
        
        // Start time must be in the future for new shifts
        if (strtotime($start_time) < time()) {
            return false;
        }
        
        // Check that times are in 15-minute intervals
        $start_minutes = date('i', strtotime($start_time));
        $end_minutes = date('i', strtotime($end_time));
        
        if ($start_minutes % 15 !== 0 || $end_minutes % 15 !== 0) {
            return false;
        }
        
        return true;
    }
}
