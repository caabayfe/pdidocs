var McpToolAclUtils = Class.create();

McpToolAclUtils.ACL_TYPE = 'mcp_server_ai_acl';
McpToolAclUtils.ACL_OPERATION = 'execute';

McpToolAclUtils.prototype = {
    initialize: function() {},

    /**
     * Creates (or reuses) an execute ACL for an sn_mcp_server tool resource and links
     * it to the supplied roles. If roleSysIds is empty, no ACL is created — tools with
     * no roles are open to all authenticated users via the REST layer.
     *
     * @param {String} resourceName - matches sys_security_acl.name, e.g. 'sn_mcp_server.incident_summarization'
     * @param {Array}  roleSysIds - sys_user_role sys_ids to attach. Must be non-empty.
     * @param {String} [scope] - sys_id of the owning application scope to stamp on created
     *                           records (e.g. sn_mcp_server's scope sys_id)
     * @returns {String|null} sys_id of the ACL that was created or reused, or null if roleSysIds is empty
     */
    createAclAndRoles: function(resourceName, roleSysIds, scope) {
        this._assertHasAdminRole();
        if (gs.nil(resourceName)) {
            throw new Error('resourceName is required');
        }

        var roles = roleSysIds || [];
        if (roles.length === 0) {
            return null;
        }

        var typeSysId = this._getAclTypeSysId();
        var aclSysId = this._createAcl(resourceName, typeSysId, scope);

        for (var i = 0; i < roles.length; i++) {
            this._createAclRole(aclSysId, roles[i], scope);
        }

        return aclSysId;
    },

    /**
     * Deletes the ACL for a resource along with all its role links.
     *
     * @param {String} resourceName - matches sys_security_acl.name
     * @returns {Boolean} true if an ACL was found and deleted, false if none existed
     */
    deleteAcl: function(resourceName) {
        this._assertHasAdminRole();
        if (gs.nil(resourceName)) {
            throw new Error('resourceName is required');
        }

        var aclSysId = this._findAclSysId(resourceName);
        if (!aclSysId) {
            return false;
        }

        var roleGr = new GlideRecord('sys_security_acl_role');
        roleGr.addQuery('sys_security_acl', aclSysId);
        roleGr.query();
        while (roleGr.next()) {
            roleGr.deleteRecord();
        }

        var aclGr = new GlideRecord('sys_security_acl');
        if (aclGr.get(aclSysId)) {
            aclGr.deleteRecord();
        }
        return true;
    },

    /**
     * Renames an existing ACL's resource name (sys_security_acl.name). Role links
     * are untouched; use updateAclRoles/removeRolesFromAcl for those.
     *
     * @param {String} oldResourceName - current sys_security_acl.name to find
     * @param {String} newResourceName - new value to set
     * @returns {Boolean} true if the ACL was found and renamed
     * @throws {Error} if an ACL named newResourceName already exists
     */
    updateAclName: function(oldResourceName, newResourceName) {
        this._assertHasAdminRole();
        if (gs.nil(oldResourceName) || gs.nil(newResourceName)) {
            throw new Error('oldResourceName and newResourceName are required');
        }

        var aclSysId = this._findAclSysId(oldResourceName);
        if (!aclSysId) {
            return false;
        }

        var collidingSysId = this._findAclSysId(newResourceName);
        if (collidingSysId && collidingSysId !== aclSysId) {
            throw new Error('An ACL named "' + newResourceName + '" already exists');
        }

        var aclGr = new GlideRecord('sys_security_acl');
        if (!aclGr.get(aclSysId)) {
            return false;
        }

        aclGr.setValue('name', newResourceName);
        return !!aclGr.update();
    },

    /**
     * Replaces the full set of roles attached to a resource ACL: removes any roles
     * not in roleSysIds and adds any that are missing. Creates the ACL if it does not
     * exist yet. Passing an empty array deletes the ACL entirely — tools with no roles
     * have no ACL and are open to all authenticated users via the REST layer.
     *
     * @param {String} resourceName - matches sys_security_acl.name
     * @param {Array}  roleSysIds - full desired set of sys_user_role sys_ids
     * @param {String} [scope] - sys_id of the owning application scope to stamp on
     *                           newly created records
     * @returns {String|null} sys_id of the ACL that was updated/created, or null if
     *                         roleSysIds is empty
     */
    updateAclRoles: function(resourceName, roleSysIds, scope) {
        this._assertHasAdminRole();
        if (gs.nil(resourceName)) {
            throw new Error('resourceName is required');
        }

        var desired = roleSysIds || [];

        if (desired.length === 0) {
            this.deleteAcl(resourceName);
            return null;
        }

        var typeSysId = this._getAclTypeSysId();
        var aclSysId = this._createAcl(resourceName, typeSysId, scope);

        var desiredSet = {};
        for (var i = 0; i < desired.length; i++) {
            desiredSet[desired[i]] = true;
        }

        var existingGr = new GlideRecord('sys_security_acl_role');
        existingGr.addQuery('sys_security_acl', aclSysId);
        existingGr.query();
        while (existingGr.next()) {
            var existingRole = existingGr.getValue('sys_user_role');
            if (desiredSet[existingRole]) {
                delete desiredSet[existingRole];
            } else {
                existingGr.deleteRecord();
            }
        }

        for (var roleSysId in desiredSet) {
            this._createAclRole(aclSysId, roleSysId, scope);
        }

        return aclSysId;
    },

    _assertHasAdminRole: function() {
        if (!gs.hasRole('sn_mcp_server.tools_admin')) {
            throw new Error('sn_mcp_server.tools_admin role is required to manage MCP tool ACLs');
        }
    },

    _findAclSysId: function(name) {
        var typeSysId = this._getAclTypeSysId();
        var aclGr = new GlideRecord('sys_security_acl');
        aclGr.addQuery('name', name);
        aclGr.addQuery('type', typeSysId);
        aclGr.addQuery('operation', McpToolAclUtils.ACL_OPERATION);
        aclGr.query();
        return aclGr.next() ? aclGr.getUniqueValue() : null;
    },

    _createAcl: function(name, typeSysId, scope) {
        var aclSysId = this._findAclSysId(name);
        if (aclSysId) {
            return aclSysId;
        }

        var aclGr = new GlideRecord('sys_security_acl');
        aclGr.initialize();
        aclGr.setValue('name', name);
        aclGr.setValue('type', typeSysId);
        aclGr.setValue('operation', McpToolAclUtils.ACL_OPERATION);
        aclGr.setValue('active', true);
        aclGr.setValue('admin_overrides', false);
        aclGr.setValue('decision_type', 'allow');
        if (scope) {
            aclGr.setValue('sys_scope', scope);
        }

        var insertedSysId = aclGr.insert();
        if (!insertedSysId) {
            throw new Error('Failed to create ACL for ' + name);
        }
        return insertedSysId;
    },

    _createAclRole: function(aclSysId, roleSysId, scope) {
        var roleGr = new GlideRecord('sys_security_acl_role');
        roleGr.addQuery('sys_security_acl', aclSysId);
        roleGr.addQuery('sys_user_role', roleSysId);
        roleGr.query();
        if (roleGr.next()) {
            return roleGr.getUniqueValue();
        }

        roleGr.initialize();
        roleGr.setValue('sys_security_acl', aclSysId);
        roleGr.setValue('sys_user_role', roleSysId);
        if (scope) {
            roleGr.setValue('sys_scope', scope);
        }

        return roleGr.insert();
    },

    _getAclTypeSysId: function() {
        var typeGr = new GlideRecord('sys_security_type');
        typeGr.addQuery('name', McpToolAclUtils.ACL_TYPE);
        typeGr.query();
        if (!typeGr.next()) {
            throw new Error('sys_security_type "' + McpToolAclUtils.ACL_TYPE + '" not found');
        }
        return typeGr.getUniqueValue();
    },

    type: 'McpToolAclUtils'
};
