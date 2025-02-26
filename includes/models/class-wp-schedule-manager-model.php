<?php
/**
 * Base model class for all models in the plugin.
 *
 * @since      1.0.0
 */
abstract class WP_Schedule_Manager_Model {

    /**
     * The table name without prefix.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $table_name    The name of the database table.
     */
    protected $table_name;

    /**
     * The primary key field name.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $primary_key    The name of the primary key field.
     */
    protected $primary_key = 'id';

    /**
     * The fields that can be set during creation or update.
     *
     * @since    1.0.0
     * @access   protected
     * @var      array    $fillable    The fields that can be set.
     */
    protected $fillable = array();

    /**
     * The database connection.
     *
     * @since    1.0.0
     * @access   protected
     * @var      wpdb    $db    The database connection.
     */
    protected $db;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     */
    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
    }

    /**
     * Get the full table name with prefix.
     *
     * @since    1.0.0
     * @return   string    The full table name.
     */
    protected function get_table() {
        return $this->db->prefix . $this->table_name;
    }

    /**
     * Find a record by ID.
     *
     * @since    1.0.0
     * @param    int      $id    The ID to find.
     * @return   object|null     The found record or null.
     */
    public function find($id) {
        return $this->db->get_row(
            $this->db->prepare(
                "SELECT * FROM {$this->get_table()} WHERE {$this->primary_key} = %d",
                $id
            )
        );
    }

    /**
     * Get all records.
     *
     * @since    1.0.0
     * @param    string    $orderby    The field to order by.
     * @param    string    $order      The order direction (ASC or DESC).
     * @return   array                 The found records.
     */
    public function all($orderby = 'id', $order = 'ASC') {
        return $this->db->get_results(
            "SELECT * FROM {$this->get_table()} ORDER BY {$orderby} {$order}"
        );
    }

    /**
     * Create a new record.
     *
     * @since    1.0.0
     * @param    array     $data    The data to insert.
     * @return   int|false          The inserted ID or false on failure.
     */
    public function create($data) {
        // Filter data to only include fillable fields
        $data = array_intersect_key($data, array_flip($this->fillable));
        
        // Insert the record
        $result = $this->db->insert(
            $this->get_table(),
            $data
        );
        
        // Return the inserted ID or false on failure
        return $result ? $this->db->insert_id : false;
    }

    /**
     * Update a record.
     *
     * @since    1.0.0
     * @param    int       $id      The ID to update.
     * @param    array     $data    The data to update.
     * @return   bool               True on success, false on failure.
     */
    public function update($id, $data) {
        // Filter data to only include fillable fields
        $data = array_intersect_key($data, array_flip($this->fillable));
        
        // Update the record
        return $this->db->update(
            $this->get_table(),
            $data,
            array($this->primary_key => $id)
        );
    }

    /**
     * Delete a record.
     *
     * @since    1.0.0
     * @param    int       $id    The ID to delete.
     * @return   bool            True on success, false on failure.
     */
    public function delete($id) {
        return $this->db->delete(
            $this->get_table(),
            array($this->primary_key => $id)
        );
    }

    /**
     * Find records by a specific field and value.
     *
     * @since    1.0.0
     * @param    string    $field     The field to search by.
     * @param    mixed     $value     The value to search for.
     * @param    string    $operator  The comparison operator.
     * @return   array                The found records.
     */
    public function find_by($field, $value, $operator = '=') {
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT * FROM {$this->get_table()} WHERE {$field} {$operator} %s",
                $value
            )
        );
    }

    /**
     * Count all records.
     *
     * @since    1.0.0
     * @return   int    The count of records.
     */
    public function count() {
        return $this->db->get_var("SELECT COUNT(*) FROM {$this->get_table()}");
    }
}
