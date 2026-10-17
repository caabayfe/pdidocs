/**
 * Provides information about roles reading from the database and caching as appropriate
 */
var RoleInfoService = Class.create();
RoleInfoService.prototype = {
    UNLIMITED_ROLE_NAMES: 'snc_internal,snc_external,public,guest'.split(','),
    EXCLUDED_ROLE_NAMES: 'admin,maint,nobody,security_admin',

    initialize: function() {
        this.ROLE_CACHE = {};
        this.arrayUtil = new global.LicensingScriptUtil();
    },

    /**
     * getRoleInfo
     * Return information about a role
     * @param {string} roleId sys_id of role record
     * @returns {object}
     */
    getRoleInfo: function(roleId) {
        if (Object.prototype.hasOwnProperty.call(this.ROLE_CACHE, roleId))
            return this.ROLE_CACHE[roleId];

        var roleInfo = this._getRoleInfo(roleId);
        if (!roleInfo)
            return null;

        this.ROLE_CACHE[roleInfo.name] = roleInfo;
        this.ROLE_CACHE[roleInfo.id] = roleInfo;

        return this.ROLE_CACHE[roleId];
    },
    /**
     * getRoleInfoByName
     * Return information about a role
     * @param {string} name of a role
     * @returns {object} role info if role with specified name is present, null otherwise
     */
    getRoleInfoByName: function(roleName) {
        if (Object.prototype.hasOwnProperty.call(this.ROLE_CACHE, roleName))
            return this.ROLE_CACHE[roleName];

        var roleIds = this._getRoleSysIds(roleName);
        if (roleIds.length == 0)
            return null;

        var roleInfo = this._getRoleInfo(roleIds[0]);
        this.ROLE_CACHE[roleInfo.name] = roleInfo;
        this.ROLE_CACHE[roleInfo.id] = roleInfo;

        return this.ROLE_CACHE[roleName];
    },

    /**
     * getAllRoles
     * Return all roles in system optionally filtering for roles with specified ACL operations.
     * Certain system roles will be filtered out (EXCLUDED_ROLE_NAMES)
     * @param {array} filterAclOps
     * @returns {array} array of {'id', 'name'}
     */
    getAllRoles: function(filterAclOps) {
        return this._getRoles(null, filterAclOps);
    },

    /**
     * Returns the list of all custom roles which are roles which are not shipped OOB/servicenow owned
     * Because the determination of what is OOB is not precise, some OOB roles can be returned.
     * However there will never be missing custom roles.
     *
     * @returns {array} array of {'id', 'name'}
     */
    getCustomRoles: function() {
        var roles = [];
        var gr = new GlideRecord('sys_user_role');

        // Use license_role.category=OOB for now. It's not maintained for platform roles,
        // however it's the best we have right now.

        // Can't use RLQUERY unfortunately because license_role.sys_user_role uses a reference
        // qualifier to store the name as the key
        //gr.addEncodedQuery('RLQUERYlicense_role.sys_user_role,=0^category=0^ENDRLQUERY');

        // use subquery which is far less efficient

        var oobRoles = this._getOOBRoles();
        gr.addQuery('name', 'NOT IN', oobRoles);

        gr.query();
        while (gr.next()) {
            if (this._isCustomRole(gr))
                roles.push({
                    'id': gr.getUniqueValue(),
                    'name': gr.name + ''
                });
        }
        return roles;
    },

    /**
     * Return roles with specified names and the roles they contain (obtained recursively)
     * optionally filtering for roles with specified ACL operations
     * @param {array} roleNames
     * @param {array} filterAclOps
     * @returns {array} array of {'id', 'name'}
     */
    getRolesByName: function(roleNames, filterAclOps) {
        return this._getRoles(this._getContainedRoleIds(this._getRoleSysIds(roleNames)).ids, filterAclOps);
    },

    _getRoleInfo: function(roleId) {
        var roleRecord = this._getRoleRecord(roleId);
        if (!roleRecord)
            return null;
        var containedRoles = this._getContainedRoleIds(roleId);
        var roleName = roleRecord.name;

        return {
            'id': roleId,
            'name': roleRecord.name,
            'applicationName': roleRecord.sys_scope.getDisplayValue(),
            'packageName': roleRecord.sys_package.getDisplayValue(),
            'packageSource': roleRecord.sys_package.source.getDisplayValue(),
            'contained': {
                'ids': containedRoles.ids,
                'maxDepth': containedRoles.maxDepth,
                'totalRoles': containedRoles.totalRoles
            },
            'unlimitedusers': this._isUnlimitedRole(roleName),
            'ootb': this._isOOTBRole(roleName)
        };
    },

    /**
     * getRoles
     * Get all the roles to analyze
     * @param {string} roleIds List of role sys_ids
     * @param {array} filterAclOps optional list of ACL operations to filter by
     * @returns {array} array of {'id', 'name'}
     */
    _getRoles: function(roleIds, filterAclOps) {
        var roles = [];

        var roleNameField;
        var roleIdField;
        var gr;
        if (filterAclOps) {
            roleNameField = 'sys_user_role.name';
            roleIdField = 'sys_user_role';
            gr = new GlideAggregate('sys_security_acl_role'); // only get roles that are used in ACLs
            gr.addQuery('sys_security_acl.type', '=', 'record');
            gr.addQuery('sys_security_acl.active', '=', true); // only loook at active ACLs
            gr.addQuery('sys_security_acl.operation', 'IN', filterAclOps);
            gr.groupBy(roleIdField);
            gr.groupBy(roleNameField);
        } else {
            roleNameField = 'name';
            roleIdField = 'sys_id';
            gr = new GlideRecord('sys_user_role'); // get all roles
        }

        if (roleIds != null)
            gr.addQuery(roleIdField, 'IN', roleIds);
        else
            gr.addQuery(roleNameField, 'NOT IN', this.EXCLUDED_ROLE_NAMES);

        gr.orderBy(roleNameField);
        gr.query();
        while (gr.next()) {
            roles.push({
                'id': gr.getValue(roleIdField),
                'name': gr.getValue(roleNameField)
            });
        }

        return roles;
    },

    /**
     * _getRoleSysIds
     * To reduce the need for joins in other queries, get the role sys_ids for later use
     * @param {*} roleNames
     * @returns {array} Array of role sys ids
     */
    _getRoleSysIds: function(roleNames) {
        var roleIds = [];
        var r = new GlideRecord('sys_user_role');
        if (!gs.nil(roleNames)) {
            r.addQuery('name', 'IN', roleNames);
        }
        r.query();
        while (r.next()) {
            roleIds.push(r.getUniqueValue());
        }
        return roleIds;
    },

    /**
     * _getContainedRoles
     * Recursive function to get all the roles this role contains.
     * @todo Can we replace the names with sys_ids?
     * @param {*} roleIds Role Sys Ids that we want to get all the contained roles for
     * @param {*} containedRoleIds The roles that we know it contains already (used for recursion)
     * @param {*} level Level we are at for recursion
     * @returns
     */
    _getContainedRoleIds: function(roleIds, containedRoleIds, level) {
        if (gs.nil(containedRoleIds)) {
            containedRoleIds = [];
        }
        var directContainsIds = [];
        if (gs.nil(level)) {
            level = 0;
        }
        var cr = new GlideRecord('sys_user_role_contains');
        cr.addQuery('role', 'IN', roleIds);
        if (containedRoleIds.length > 0) {
            cr.addQuery('role', 'NOT IN', containedRoleIds);
        }
        cr.query();

        while (cr.next()) {
            directContainsIds.push(cr.getValue('contains'));
        }

        // add in seed role on the first pass
        if (level == 0) {
            containedRoleIds = this.arrayUtil.union(containedRoleIds, roleIds);
        }

        var maxDepth = level;
        if (directContainsIds.length > 0) {
            var roleInfo = this._getContainedRoleIds(directContainsIds, Array.from(containedRoleIds), ++level);
            containedRoleIds = this.arrayUtil.union(containedRoleIds, roleInfo.ids);
            maxDepth = roleInfo.maxDepth;
        }

        containedRoleIds = this.arrayUtil.union(containedRoleIds, directContainsIds);

        return {
            'maxDepth': maxDepth,
            'ids': containedRoleIds,
            'totalRoles': containedRoleIds.length,
            'direct': directContainsIds
        };
    },

    /**
     * _getRoleNames
     * Translate role sys_ids to role names
     * @param {*} roleIds
     * @returns
     */
    _getRoleNames: function(roleIds) {
        var roleNames = [];
        if (roleIds) {
            var r = new GlideRecord('sys_user_role');
            r.addQuery('sys_id', 'IN', roleIds);
            r.query();
            while (r.next()) {
                roleNames.push(r.getValue('name'));
            }
        }
        return roleNames;
    },

    /**
     * getRoleRecord
     * @param {*} roleId Sys id of the role to get the detail for
     * @returns {sys_user_role}
     */
    _getRoleRecord: function(roleId) {
        var roleInfo = new GlideRecord('sys_user_role');
        roleInfo.get(roleId);
        return roleInfo;
    },

    /**
     * _getOOBRoles
     * Return list of role names marked as OOB in license_role
     * @returns {array}
     */
    _getOOBRoles: function() {
        var r = new GlideRecord('license_role');
        r.addQuery('category', '=', '0'); // ServiceNow OOB
        r.query();
        r.orderBy('sys_user_role')
        var roles = [];
        while (r.next()) {
            roles.push(r.sys_user_role + '');
        }

        return roles;
    },

    /**
     * _isOOTBRole
     * Check whether specified role is marked as OOB in license_role. Note that return of false does not necessarily mean that
     * specified role is NOT OOB because license_role maintenance for platform roles is manual
     * @param {string} roleName
     * @returns boolean
     */
    _isOOTBRole: function(roleName) {
        var r = new GlideRecord('license_role');
        r.addQuery('category', '=', '0'); // ServiceNow OOB
        r.addQuery('name', '=', roleName);
        r.query();
        return r.hasNext();
    },

    /**
     * Given the GlideRecord for a sys_user_role record, return true if role is a custom role based on the scope
     * and customer updates to the record
     * 1. if in global scope or in servicenow, it's a custom role if its in customer updates, servicenow role otherwise
     * 2. else if it's in a custom app scope, it's a custom role
     * 3. else if it's a store app and owned by vendor, it's a custom role
     * 4. false otherwise
     * @param {GlideRecord} roleGr 
     * @returns boolean true if custom role, false if not
     */
    _isCustomRole: function(roleGr) {
        const scopeName = roleGr.sys_scope.scope.toString();
        if (scopeName == 'global' || new global.LicensingEngineGlobalHelper().isServiceNowScope(scopeName))
            return this._isPresentInCustomerUpdates(roleGr);
        if (this._isCustomApp(roleGr.sys_scope.getRefRecord()))
            return true;
        if (this._isOwnedStoreApp(roleGr.sys_scope.getRefRecord()))
            return true;
        return false;
    },

    /**
     * Given sys_scope record, return true if app with that scope is a custom app being developed on the instance
     * @param {GlideRecord} scopeGr
     * @returns boolean true if custom app, false otherwise
     */
    _isCustomApp: function(scopeGr) {
        // replace this with Scope.isCustomApp()
        return scopeGr.sys_class_name == 'sys_app';
    },

    /**
     * Given sys_scope record, return true if app is a store app which has been authored by the customer who owns
     * current instance.
     * @param {GlideRecord} scopeGr
     * @returns boolean true if own app, false otherwise
     */
    _isOwnedStoreApp: function(scopeGr) {
        // replace this with Scope.isStoreApp()
        if (scopeGr.sys_class_name != 'sys_store_app')
            return false;

        // replace with !Scope.isThirdPartyApp() without global check + AppScopeNamer type check
        const vendorKeys = gs.getProperty('sn_appauthor.all_company_keys', '').split(',');
        const companyCode = gs.getProperty('glide.appcreator.company.code', '');
        if (companyCode != '' && vendorKeys.indexOf(companyCode) < 0)
            vendorKeys.push(companyCode);
        const scopeName = scopeGr.scope.toString();

        return vendorKeys.findIndex(vendorKey => scopeName.startsWith('x_' + vendorKey + '_')) >= 0;
    },

    /**
     * Given the GlideRecord for a sys_user_role record, check with customer updates and return true if found in there.
     * Note that presence in customer updates indicates 
     * 1. a customized OOB role
     * 2. a custom role
     * We are interested only in the second, and this is a reasonable approximation. This will return true if a customer
     * has customized an OOB role record (the record iteself, not where it's used etc), but that is very unlikely
     *
     * @param {GlideRecord} roleGr
     * @returns boolean true if present in customer updates, false if not
     */
    _isPresentInCustomerUpdates: function(roleGr) {
        return !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(roleGr.sys_update_name + '');
    },

    _isUnlimitedRole: function(roleName) {
        return this.arrayUtil.contains(this.UNLIMITED_ROLE_NAMES, roleName);
    },

    type: 'RoleInfoService'
};
