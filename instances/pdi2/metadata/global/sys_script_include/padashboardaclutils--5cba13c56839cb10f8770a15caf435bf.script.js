var PADashboardACLUtils = Class.create();
PADashboardACLUtils.prototype = {
    ROLE_TYPE_PERMISSION: 1,
    GROUP_TYPE_PERMISSION: 2,
    USER_TYPE_PERMISSION: 3,

    initialize: function() {},

    /**
     * Returns true if the current user is the owner of the given dashboard
     * or has an explicit write grant via pa_dashboards_permissions.
     * @param {string} dashboardSysId - sys_id of the pa_dashboards record
     */
    userCanWriteDashboard: function(dashboardSysId) {
        var dashboard = new GlideRecord('pa_dashboards');
        if (!dashboard.get(dashboardSysId))
            return false;

        if (gs.getUserID() == dashboard.getValue('owner'))
            return true;

        var dp = new GlideRecord('pa_dashboards_permissions');
        dp.addQuery('dashboard', dashboardSysId);
        dp.addQuery('write', true);
        dp.orderBy('type');
        dp.query();
        while (dp.next()) {
            var identityType = parseInt(dp.getValue('type'));
            var identitySysId = dp.getValue('identity');
            var hasAccess = false;
            switch (identityType) {
                case this.ROLE_TYPE_PERMISSION:
                    hasAccess = gs.getUser().hasRole(identitySysId);
                    break;
                case this.GROUP_TYPE_PERMISSION:
                    hasAccess = gs.getUser().isMemberOf(identitySysId);
                    break;
                case this.USER_TYPE_PERMISSION:
                    hasAccess = gs.getUserID() == identitySysId;
                    break;
            }
            if (hasAccess)
                return true;
        }
        return false;
    },

    type: 'PADashboardACLUtils'
};
