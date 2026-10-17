var CustomizedOobRoleDetector = Class.create();
CustomizedOobRoleDetector.prototype = {
    initialize: function() {
        this._userRoleDao = new sn_entitlement.UserRoleDao();
    },

    /**
     * Retrieves an array of roleIds that have modifications since timestamp
     * 
     * @param {timestamp} timestamp The timestamp that acts as a starting point to detect changes
     * @return {array} An array of sys_user_role.sys_id values
     */
    getCustomizedOobRoleIdsSinceTimestamp: function(timestamp) {
        const roleIdsOob = this._userRoleDao.getUserRoleIdsByIsOob();

        const roleIdsFromAclRoles = this._userRoleDao.getRoleIdsBySecurityAclRoleUpdatedSince(timestamp);

        const roleIdsFromAcls = this._userRoleDao.getRoleIdsBySecurityAclUpdatedSince(timestamp);

        return [...new Set([...roleIdsFromAclRoles, ...roleIdsFromAcls])]
            .filter(roleId => this._isValidRoleId(roleId))
            .filter(roleId => this._isRoleIdOob(roleIdsOob, roleId));
    },

    _isValidRoleId: function(roleId) {
        return roleId && roleId.length > 0;
    },

    _isRoleIdOob: function(roleIdsOob, roleId) {
        return roleIdsOob.indexOf(roleId) > -1;
    },

    type: 'CustomizedOobRoleDetector'
};
