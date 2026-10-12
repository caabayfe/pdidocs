var TimeLimitedRoleConfigHelper = Class.create();
    TimeLimitedRoleConfigHelper.prototype = {
      initialize: function() {
    },

    getRolesRefQual: function() {
        var names = gs.getProperty('glide.security.timelimited.roles.allowed_roles', 'admin,impersonator,snc_read_only,snc_required_script_writer_permission');
        return "nameIN" + names;
    },

    type: 'TimeLimitedRoleConfigHelper'
};
