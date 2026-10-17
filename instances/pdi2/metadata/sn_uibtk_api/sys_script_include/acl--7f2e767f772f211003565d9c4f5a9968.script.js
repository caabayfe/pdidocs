const ACL = Class.create();
ACL.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_security_acl',
    FIELDS: ['name'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },
    getRoles: function(aclQuery) {
        let roles = [];
        const roleHandler = new ACLRole(false, this.noDomain, true);
        const aclGR = this.getRecordsByQuery(aclQuery, 'sys_user_role', true);
        if (aclGR) {
            while (aclGR.next()) {
                const roleGR = roleHandler.getRecordsByQuery('sys_security_acl=' + aclGR.sys_id.toString());
                roles = [...roles, ...roleGR];
            }
            return roles;
        }
    },

    type: 'ACL'
});
