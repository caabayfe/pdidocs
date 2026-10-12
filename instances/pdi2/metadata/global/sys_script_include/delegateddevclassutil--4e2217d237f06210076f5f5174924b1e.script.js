var DelegatedDevClassUtil = Class.create();
DelegatedDevClassUtil.prototype = {
    initialize: function() {},

    canGrantOrRevokeScriptingGovernanceRole: function() {
        var hasAccess = false;
        if (SNC.ScriptingGovernanceUtils) {
            hasAccess = SNC.ScriptingGovernanceUtils.canGrantOrRevokeScriptingGovernanceRole();
            return hasAccess;
        }

        // something went wrong
        gs.logError("DelegatedDevClassUtil: Scripting util not defined or inaccessible");
        return hasAccess;
    },

    type: 'DelegatedDevClassUtil'
};
