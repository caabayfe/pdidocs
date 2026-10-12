const ACLRole = Class.create();
ACLRole.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_security_acl_role',
    FIELDS: ['sys_user_role','sys_security_acl'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    type: 'ACLRole'
});
