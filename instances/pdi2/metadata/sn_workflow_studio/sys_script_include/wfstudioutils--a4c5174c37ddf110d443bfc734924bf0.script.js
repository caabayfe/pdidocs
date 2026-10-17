var WFStudioUtils = Class.create();

WFStudioUtils.prototype = {
    initialize: function() {},

    userIsPADDelegatedDev: function() {
        return this._hasDDRole('processautomationdesigner', this._getUserRoles());
    },

    userIsFDDelegatedDev: function() {
        return this._hasDDRole('flowdesigner', this._getUserRoles());
    },

    userIsDecisionTablesDelegatedDev: function() {
        return this._hasDDRole('decisiontables', this._getUserRoles());
    },

    _getUserRoles: function() {
        var currentUser = gs.getUser();
        var roles = (currentUser.getRoles() + "").split(",");
        return roles;
    },

    _hasDDRole: function(ddRoleMatcher, roles) {
        var ddRoleMatcherRegEx = new RegExp('^sn_dd_[a-z0-9_-]+_' + ddRoleMatcher + '(_rc_\\d+)?$');
        return roles.some(function(role) {
            return ddRoleMatcherRegEx.test(role);
        });
    },

    _getMyDelegDevRoles: function() {
        var roles = [];
        var roleQuery = new GlideRecord("sys_user_has_role");
        roleQuery.addQuery("role.name", "STARTSWITH", "sn_dd_");
        roleQuery.addQuery("user", gs.getUserID());
        roleQuery.query();
        while (roleQuery.next()) {
            roles.push(roleQuery.getValue("role"));
        }
        return roles;
    },

    _getMyDelegDevApps: function(roles) {
        var ddApps = [];
        var allMetaPermSetId = "043a115e679112006cc2956c33415a36"; // User has access to all metadata
        var fdPermSetId = "d3ef33c067200300c4098c7942415a50"; // User has access to FD metadata
        var permAssignments = new GlideRecord("sys_scope_permission_set_role_assignment");
        permAssignments.addQuery("role", roles);
        permAssignments.addQuery("permission_set", fdPermSetId)
            .addOrCondition("permission_set", allMetaPermSetId);
        permAssignments.query();
        while (permAssignments.next()) {
            ddApps.push(permAssignments.getValue("scope"));
        }
        return ddApps;
    },

    fdFixedQuery: function() {
        var query = '';
        if (gs.hasRole("delegated_developer") && !gs.hasRole('flow_designer')) {
            var ddRoles = this._getMyDelegDevRoles();
            var ddApps = this._getMyDelegDevApps(ddRoles);
            if (ddApps.length > 0)
                query = "sys_scopeIN" + ddApps;
        }
        return query;
    },

    type: 'WFStudioUtils'
};
