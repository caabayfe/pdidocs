var UserUtil = (function() {

    var isDecisionTableAdmin = gs.hasRole('decision_table_admin');
    var isDecisionTableReader = gs.hasRole('decision_table_reader');
    var isChangeManager = gs.hasRole('change_manager');
    var isDecisionRuleAuthor = gs.hasRole('decision_rule_author');
    var isDecisionResultEditor = gs.hasRole('decision_result_editor');
    return {

        // user gets delegated access if atleast one accessible scope has decision table permission
        hasDelegatedAccess: function() {
            var accessibleScopeIds = this._getAccessibleScopeIds();
            for (var i = 0; i < accessibleScopeIds.length; i++) {
                if (this._hasDecisionTablePermission(accessibleScopeIds[i])) {
                    return true;
                }
            }
            return false;
        },

        getUserLocal: function() {
            return gs.getSession().getLanguage();
        },

        getScopeIdsAccessibleByDelegatedDev: function() {
            var accessibleScopeIds = this._getAccessibleScopeIds();
            var scopeIdsWithDecisionTablePermission = [];
            for (var i = 0; i < accessibleScopeIds.length; i++) {
                if (this._hasDecisionTablePermission(accessibleScopeIds[i])) {
                    scopeIdsWithDecisionTablePermission.push(accessibleScopeIds[i]);
                }
            }
            return scopeIdsWithDecisionTablePermission;
        },

        _hasDecisionTablePermission: function(sysId) {
            return gs.hasRightsTo('api/now.decision_tables/allow', {
                scopeId: sysId
            });
        },

        _getAccessibleScopeIds: function() {
            return gs.getSession().getApplicationPickerList().map(function(app) {
                return app.sysId;
            });
        },

        // Graphql acls do not support advanced/ script level configurations
        // We need advanced acl for our use cases and hence cannot rely on linking acl to graphql api 
        // This check has to be made to accommodate graphql execution security at resolver level as a work around 

        hasGraphQLAccess: function() {
            return isDecisionTableAdmin || isDecisionTableReader || isChangeManager || this.hasDelegatedAccess();
        },

        hasDTCrudAccess: function() {
            return isDecisionTableAdmin || isChangeManager || isDecisionResultEditor || isDecisionRuleAuthor || this.hasDelegatedAccess();
        },

        hasDTAdminAccess: function() {
            return isDecisionTableAdmin || this.hasDelegatedAccess();
        },

        hasRESTAPIAccess: function() {
            return this.hasGraphQLAccess();
        },

        hasDelegatedAccessAlone: function() {
            return this.hasDelegatedAccess() && !(isDecisionTableAdmin);
        },

        getCurrentSessionDomain: function() {
            var dt = new sn_dt.DecisionTableBuilderAPI();
            return dt.getCurrentSessionDomain() || '';
        }
    };
})();
