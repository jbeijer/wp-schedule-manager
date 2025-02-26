<?php
/**
 * Organization model class.
 *
 * @since      1.0.0
 */
class WP_Schedule_Manager_Organization extends WP_Schedule_Manager_Model {

    /**
     * The table name without prefix.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $table_name    The name of the database table.
     */
    protected $table_name = 'schedule_organizations';

    /**
     * The fields that can be set during creation or update.
     *
     * @since    1.0.0
     * @access   protected
     * @var      array    $fillable    The fields that can be set.
     */
    protected $fillable = array(
        'name',
        'description',
        'parent_id'
    );

    /**
     * Get all child organizations of a parent organization.
     *
     * @since    1.0.0
     * @param    int       $parent_id    The parent organization ID.
     * @return   array                   The child organizations.
     */
    public function get_children($parent_id) {
        return $this->find_by('parent_id', $parent_id);
    }

    /**
     * Get all parent organizations of an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         The parent organizations.
     */
    public function get_parents($organization_id) {
        $parents = array();
        $organization = $this->find($organization_id);
        
        while ($organization && $organization->parent_id) {
            $parent = $this->find($organization->parent_id);
            if ($parent) {
                $parents[] = $parent;
                $organization = $parent;
            } else {
                break;
            }
        }
        
        return $parents;
    }

    /**
     * Get all organizations in the hierarchy (parents, current, and all children recursively).
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         All organizations in the hierarchy.
     */
    public function get_hierarchy($organization_id) {
        $hierarchy = array();
        
        // Add parents
        $parents = $this->get_parents($organization_id);
        $hierarchy = array_merge($hierarchy, $parents);
        
        // Add current organization
        $current = $this->find($organization_id);
        if ($current) {
            $hierarchy[] = $current;
        }
        
        // Add children recursively
        $this->add_children_to_hierarchy($organization_id, $hierarchy);
        
        return $hierarchy;
    }

    /**
     * Recursively add children to the hierarchy array.
     *
     * @since    1.0.0
     * @access   private
     * @param    int       $parent_id    The parent organization ID.
     * @param    array     &$hierarchy   The hierarchy array to add to.
     */
    private function add_children_to_hierarchy($parent_id, &$hierarchy) {
        $children = $this->get_children($parent_id);
        
        foreach ($children as $child) {
            $hierarchy[] = $child;
            $this->add_children_to_hierarchy($child->id, $hierarchy);
        }
    }

    /**
     * Get the root organizations (those with no parent).
     *
     * @since    1.0.0
     * @return   array    The root organizations.
     */
    public function get_roots() {
        return $this->db->get_results(
            "SELECT * FROM {$this->get_table()} WHERE parent_id IS NULL OR parent_id = 0"
        );
    }

    /**
     * Check if an organization is a descendant of another.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID to check.
     * @param    int       $potential_parent_id    The potential parent organization ID.
     * @return   bool                          True if it is a descendant, false otherwise.
     */
    public function is_descendant_of($organization_id, $potential_parent_id) {
        $parents = $this->get_parents($organization_id);
        
        foreach ($parents as $parent) {
            if ($parent->id == $potential_parent_id) {
                return true;
            }
        }
        
        return false;
    }
}
