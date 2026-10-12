var AccessAuditorSuiteUtil = Class.create();
AccessAuditorSuiteUtil.prototype = {
    initialize: function() {},

    // Helper function to collect roles from an ACL
    collectRolesFromAcl: function(aclId, rolesArray) {
        var aclRoleGR = new GlideRecord('sys_security_acl_role');
        aclRoleGR.addQuery('sys_security_acl', aclId);
        aclRoleGR.query();

        while (aclRoleGR.next()) {
            var roleId = aclRoleGR.getValue('sys_user_role');
            if (rolesArray.indexOf(roleId) === -1) {
                rolesArray.push(roleId);
            }
        }
    },

    // Helper function to get all roles a user has
    getUserRoles: function(userId) {
        var userRoles = [];
        var userRoleGR = new GlideRecord('sys_user_has_role');
        userRoleGR.addQuery('user', userId);
        userRoleGR.query();

        while (userRoleGR.next()) {
            userRoles.push(userRoleGR.getValue('role'));
        }

        return userRoles;
    },

    buildRoleContainmentMap: function() {
        var containmentMap = {};
        var roleContainsGR = new GlideRecord('sys_user_role_contains');
        roleContainsGR.query();
        while (roleContainsGR.next()) {
            var parentRole = roleContainsGR.getValue('role'); // Container role
            var childRole = roleContainsGR.getValue('contains'); // Contained role

            if (!containmentMap[childRole]) {
                containmentMap[childRole] = [];
            }
            containmentMap[childRole].push(parentRole);
        }
        return containmentMap;
    },

    userHasRole: function(userRoles, roleToCheck, containmentMap) {
        // Direct role check
        if (userRoles.indexOf(roleToCheck) !== -1) {
            return true;
        }

        // Check through role containment (recursively)
        return this.checkRoleContainment(userRoles, roleToCheck, containmentMap, []);
    },

    // Recursive function to check role containment
    checkRoleContainment: function(userRoles, roleToCheck, containmentMap, checkedRoles) {
        // Prevent infinite loops by tracking checked roles
        if (checkedRoles.indexOf(roleToCheck) !== -1) {
            return false;
        }
        checkedRoles.push(roleToCheck);

        // If this role isn't contained by any other roles, return false
        if (!containmentMap[roleToCheck]) {
            return false;
        }

        // Check if the user has any of the parent roles that contain this role
        var parentRoles = containmentMap[roleToCheck];
        for (var i = 0; i < parentRoles.length; i++) {
            var parentRole = parentRoles[i];

            // If user has this parent role directly
            if (userRoles.indexOf(parentRole) !== -1) {
                return true;
            }

            // Check if user has any role that contains this parent role (recursive check)
            if (this.checkRoleContainment(userRoles, parentRole, containmentMap, checkedRoles)) {
                return true;
            }
        }

        return false;
    },

    isRoleDirectlyAssigned: function(roleId) {
        var gr = new GlideRecord('sys_user_has_role');
        gr.addQuery("role", roleId);
        gr.addQuery('inherited', false);
        gr.addQuery('state', 'active');
        gr.query();

        if (gr.hasNext()) {
            return true;
        }
        return false;
    },

    // Helper function to find all groups containing role with roleId
    findGroupsHavingRole: function(roleSysId) {
        var groups = [];
        if (!roleSysId || roleSysId === '') {
            return groups;
        }

        var groupRoleGR = new GlideRecord('sys_group_has_role');
        groupRoleGR.addQuery('role', roleSysId);
        groupRoleGR.addQuery('inherits', true);
        groupRoleGR.query();

        while (groupRoleGR.next()) {
            var groupSysId = groupRoleGR.getValue('group');
            var groupName = groupRoleGR.group.name;
            if (groupSysId && groupSysId !== '') {
                groups.push(groupName);
            }
        }

        return groups;
    },

    /**
     * Find all directly or indirectly containing roles for the specified role, including itself
     * 
     * @param {string} roleSysId - The sys_id of the role to analyze
     * @return {Array} Array of role sys_ids that contain the specified role
     */
    findAllContainingRolesForRole: function(roleSysId) {
        var result = [];
        var visited = {}; // Use object as Set for tracking visited roles
        this._findAllContainingRolesForRoleRecursive(roleSysId, result, visited);
        return result;
    },

    /**
     * Find all directly or indirectly contained roles for the specified role, including itself
     * 
     * @param {string} roleSysId - The sys_id of the role to analyze
     * @return {Array} Array of role sys_ids that are contained by the specified role
     */
    findAllContainedRolesForRole: function(roleSysId) {
        var result = [];
        var visited = {}; // Use object to track visited roles (like Java Set)
        this._findAllContainedRolesForRoleRecursive(roleSysId, result, visited);
        return result;
    },

    /**
     * Private recursive helper function to find all contained roles
     * 
     * @param {string} roleSysId - The role sys_id to process
     * @param {Array} result - Array to store the results
     * @param {Object} visited - Object to track visited roles to prevent infinite loops
     */
    _findAllContainedRolesForRoleRecursive: function(roleSysId, result, visited) {
        // Check for null/empty roleSysId or if already visited (like Java StringUtil.nil check)
        if (!roleSysId || roleSysId === '' || visited[roleSysId]) {
            return;
        }

        // Mark as visited and add to result
        visited[roleSysId] = true;
        result.push(roleSysId);

        // Find directly contained roles, and then recursively process the contained ones
        var containedRoles = this._findContainedRoles(roleSysId);
        for (var i = 0; i < containedRoles.length; i++) {
            this._findAllContainedRolesForRoleRecursive(containedRoles[i], result, visited);
        }
    },

    /**
     * Find all directly contained roles for the specified role
     * 
     * @param {string} roleSysId - The sys_id of the role to analyze
     * @return {Array} Array of directly contained role sys_ids
     */
    _findContainedRoles: function(roleSysId) {
        var result = [];

        // Query the sys_user_role_contains table (equivalent to SYS_USER_ROLE_CONTAINS constant)
        var roleContainsGR = new GlideRecord('sys_user_role_contains');
        roleContainsGR.addQuery('role', roleSysId); // equivalent to ROLE field
        roleContainsGR.query();

        while (roleContainsGR.next()) {
            // Get the contained role sys_id (equivalent to CONTAINS field)
            var containedRoleSysId = roleContainsGR.getValue('contains');
            var containedRoleName = roleContainsGR.role.name;
            result.push(containedRoleName);
        }

        return result;
    },

    getRecordLink: function(gr, linkText) {
        if (!gr || !gr.isValidRecord()) {
            return '';
        }
        var href = gr.getLink(true);

        var recordLink = "<a target='_blank' href=" + href + ">" + linkText + "</a>";
        return recordLink;
    },

    isCustomRecord: function(record) {
        var gr = new GlideRecord('sys_update_xml');
        gr.addQuery('name', record.sys_class_name + "_" + record.sys_id);
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },


    type: 'AccessAuditorSuiteUtil'
};
