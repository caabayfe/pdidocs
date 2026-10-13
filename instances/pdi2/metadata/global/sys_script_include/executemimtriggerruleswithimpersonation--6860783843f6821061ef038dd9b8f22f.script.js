var ExecuteMIMTriggerRulesWithImpersonation = Class.create();
ExecuteMIMTriggerRulesWithImpersonation.prototype = {
    initialize: function() {},

    triggerMIMRulesWithImpersonation: function(incidentRec, userId) {
        var impersonator = new GlideImpersonate();
        var originalUser = impersonator.impersonate(userId);
        try {
            var mim = new sn_major_inc_mgmt.MajorIncidentTriggerRules(incidentRec);
            mim.evaluateRules();
        } finally {
            impersonator.impersonate(originalUser);
        }
    },

    type: 'ExecuteMIMTriggerRulesWithImpersonation'
};
