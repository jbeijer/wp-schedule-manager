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
        'parent_id',
        'path'
    );

    /**
     * Create a new organization.
     *
     * @since    1.0.0
     * @param    array     $data    The data to insert.
     * @return   int|false          The inserted ID or false on failure.
     */
    public function create($data) {
        $parent_id = isset($data['parent_id']) ? intval($data['parent_id']) : null;
        $parent_path = '/';

        if ($parent_id) {
            $parent = $this->find($parent_id);
            if ($parent && !empty($parent->path)) {
                $parent_path = $parent->path;
            } else {
                // Parent exists, but has no path. This is an error!
                error_log("Parent organization {$parent_id} exists but has empty path.");
            }
        }

        $data['path'] = $parent_path;  // Initialize the path

        $insert_result = parent::create($data);  // Call the base create function

        if ($insert_result) {
            $new_id = $this->db->insert_id;
            $new_path = $parent_path . $new_id . '/';

            $this->db->update(
                $this->get_table(),
                ['path' => $new_path],
                ['id' => $new_id],
                ['%s'],  // Path format
                ['%d']   // ID format
            );

            // Update children paths if any
            $this->update_children_paths($new_id, $new_path);

            return $new_id;
        } else {
            return false;
        }
    }

    /**
     * Update an organization.
     *
     * @since    1.0.0
     * @param    int       $id      The ID to update.
     * @param    array     $data    The data to update.
     * @return   bool               True on success, false on failure.
     */
    public function update($id, $data) {
        $current = $this->find($id);
        if (!$current) {
            return false;
        }

        // Check if we're changing the parent
        $new_parent_id = isset($data['parent_id']) ? (is_numeric($data['parent_id']) ? intval($data['parent_id']) : null) : $current->parent_id;
        
        // Prevent circular references
        if ($new_parent_id == $id) {
            error_log("Attempted to set organization {$id} as its own parent.");
            return false;
        }
        
        // Check if the new parent is a descendant of this organization (would create a loop)
        if ($new_parent_id && $this->is_descendant($new_parent_id, $id)) {
            error_log("Attempted to set a descendant organization {$new_parent_id} as parent of {$id}.");
            return false;
        }

        // If there are no changes to the parent, do a simple update
        if ($new_parent_id === (is_numeric($current->parent_id) ? intval($current->parent_id) : null)) {
            return parent::update($id, $data);
        }

        // Calculate new path based on new parent
        $new_path = '/';
        if ($new_parent_id) {
            $new_parent = $this->find($new_parent_id);
            if ($new_parent && !empty($new_parent->path)) {
                $new_path = $new_parent->path . $id . '/';
            } else {
                $new_path = '/' . $id . '/';
            }
        } else {
            $new_path = '/' . $id . '/';
        }

        $data['path'] = $new_path;

        $update_result = parent::update($id, $data);

        if ($update_result) {
            // Update paths of all children
            $this->update_children_paths($id, $new_path);
        }

        return $update_result;
    }

    /**
     * Check if an organization is a descendant of another organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID to check.
     * @param    int       $potential_ancestor_id The potential ancestor organization ID.
     * @return   bool                         True if it is a descendant, false otherwise.
     */
    public function is_descendant($organization_id, $potential_ancestor_id) {
        $organization = $this->find($organization_id);
        if (!$organization || !$organization->path) {
            return false;
        }

        // Check if the potential ancestor's ID is in the path
        return strpos($organization->path, '/' . $potential_ancestor_id . '/') !== false;
    }

    /**
     * Recursively update the paths of all children of an organization.
     *
     * @since    1.0.0
     * @access   private
     * @param    int       $parent_id    The parent organization ID.
     * @param    string    $parent_path  The parent organization path.
     */
    private function update_children_paths($parent_id, $parent_path) {
        $children = $this->get_children($parent_id);

        if ($children) {
            foreach ($children as $child) {
                $new_path = $parent_path . $child->id . '/';

                $this->db->update(
                    $this->get_table(),
                    ['path' => $new_path],
                    ['id' => $child->id],
                    ['%s'],
                    ['%d']
                );

                // Recursively update children
                $this->update_children_paths($child->id, $new_path);
            }
        }
    }

    /**
     * Get all child organizations of a parent organization.
     *
     * @since    1.0.0
     * @param    int       $parent_id    The parent organization ID.
     * @return   array                   The child organizations.
     */
    public function get_children($parent_id) {
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT * FROM {$this->get_table()} WHERE parent_id = %d ORDER BY name ASC",
                $parent_id
            )
        );
    }

    /**
     * Get all parent organizations of an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         The parent organizations.
     */
    public function get_ancestors($organization_id) {
        $organization = $this->find($organization_id);
        if (!$organization || !$organization->path) {
            return [];
        }

        // Extract ancestor IDs from the path
        $path = trim($organization->path, '/');
        if (empty($path)) {
            return [];
        }

        $ancestor_ids = explode('/', $path);
        // Remove the current organization ID if it's in the path
        if (end($ancestor_ids) == $organization_id) {
            array_pop($ancestor_ids);
        }

        if (empty($ancestor_ids)) {
            return [];
        }

        $ancestors = [];
        foreach ($ancestor_ids as $ancestor_id) {
            if (!empty($ancestor_id)) {
                $ancestor = $this->find($ancestor_id);
                if ($ancestor) {
                    $ancestors[] = $ancestor;
                }
            }
        }

        return $ancestors;
    }

    /**
     * Get the direct parent of an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   object|null                   The parent organization or null.
     */
    public function get_parent($organization_id) {
        $organization = $this->find($organization_id);
        
        if ($organization && $organization->parent_id) {
            return $this->find($organization->parent_id);
        }
        
        return null;
    }

    /**
     * Get all organizations in the hierarchy (current, ancestors, and all descendants).
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         All organizations in the hierarchy.
     */
    public function get_hierarchy($organization_id) {
        $hierarchy = [];
        
        // Add current organization
        $current = $this->find($organization_id);
        if ($current) {
            $hierarchy[] = $current;
        }
        
        // Add ancestors
        $ancestors = $this->get_ancestors($organization_id);
        $hierarchy = array_merge($hierarchy, $ancestors);
        
        // Add descendants recursively
        $descendants = $this->get_descendants($organization_id);
        $hierarchy = array_merge($hierarchy, $descendants);
        
        return $hierarchy;
    }

    /**
     * Get all descendants of an organization.
     *
     * @since    1.0.0
     * @param    int       $organization_id    The organization ID.
     * @return   array                         The descendant organizations.
     */
    public function get_descendants($organization_id) {
        $organization = $this->find($organization_id);
        if (!$organization) {
            return [];
        }

        // Use the path to find all descendants
        return $this->db->get_results(
            $this->db->prepare(
                "SELECT * FROM {$this->get_table()} WHERE path LIKE %s AND id != %d ORDER BY path ASC",
                '%/' . $organization_id . '/%',
                $organization_id
            )
        );
    }

    /**
     * Get all root organizations (those without a parent).
     *
     * @since    1.0.0
     * @return   array    The root organizations.
     */
    public function get_roots() {
        return $this->db->get_results(
            "SELECT * FROM {$this->get_table()} WHERE parent_id IS NULL ORDER BY name ASC"
        );
    }

    /**
     * Get the full hierarchical tree of organizations.
     *
     * @since    1.0.0
     * @return   array    The organization tree.
     */
    public function get_tree() {
        // Get all organizations
        $all_organizations = $this->all('name', 'ASC');
        
        // Build a tree structure
        $tree = [];
        $map = [];
        
        // First pass: create a map of all organizations
        foreach ($all_organizations as $org) {
            $map[$org->id] = (array) $org;
            $map[$org->id]['children'] = [];
        }
        
        // Second pass: build the tree
        foreach ($map as $id => $org) {
            if ($org['parent_id']) {
                // This organization has a parent, add it to the parent's children
                if (isset($map[$org['parent_id']])) {
                    $map[$org['parent_id']]['children'][] = &$map[$id];
                } else {
                    // Parent doesn't exist, add to root
                    $tree[] = &$map[$id];
                }
            } else {
                // This is a root organization
                $tree[] = &$map[$id];
            }
        }
        
        return $tree;
    }
}
