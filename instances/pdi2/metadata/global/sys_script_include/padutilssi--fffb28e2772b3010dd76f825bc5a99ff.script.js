var PADUtilsSI = Class.create();
PADUtilsSI.prototype = {
    initialize: function() {
        this.pdACLUtils;
    },

    isAdminUser: function() {
        return gs.hasRole(PD_ADMIN_ROLE);
    },

    userHasCreateActivityDefAccess: function() {
        return new GlideRecord(PDConstants.TABLES.PD_ACTIVITY_DEFINITION).canCreate();
    },

    userHasCreateProcessDefAccess: function() {
        return new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION).canCreate();
    },

    userHasUpdateProcessDefAccess: function() {
        return new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION).canWrite();
    },

    userIsPADDelegatedDev: function() {
        var pdACLUtils = new PDACLUtils();
        return pdACLUtils.hasDelegatedAccessToPlaybookApi();
    },

    isPADAuthorizedUser: function() {
        var padRoleConstants = PADConstants.ROLES;
        var playbookRoles = [
            padRoleConstants.PD_ADMIN_ROLE,
            padRoleConstants.PLAYBOOK_WRITE,
            padRoleConstants.PD_OPERATOR,
            padRoleConstants.CONTENT_AUTHOR_ROLE,
            padRoleConstants.PD_TRIGGER_AUTHOR,
            padRoleConstants.PD_SHARED_ADMIN,
            padRoleConstants.PD_SHARED_USER
        ];
        return gs.hasRole(playbookRoles) || this.userIsPADDelegatedDev();
    },

    getOrDefault: function(object, key, defaultValue) {
        var value = object[key];
        if (JSUtil.nil(value))
            return defaultValue;
        return value;
    },

    getFieldReturnValue: function(gr, fieldName) {
        return {
            value: gr.getValue(fieldName),
            display_value: gr.getDisplayValue(fieldName)
        };
    },

    type: 'PADUtilsSI'
};
