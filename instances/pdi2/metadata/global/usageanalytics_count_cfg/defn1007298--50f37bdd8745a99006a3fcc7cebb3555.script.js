answer = getRecordsCount();

function getRecordsCount() {
    var count = 0;
    var aAPluginActive = GlidePluginManager.isActive("com.snc.adaptive_authentication");
    var aAPropertyEnabled = GlideProperties.getBoolean("glide.authenticate.auth.policy.enabled");
    if (aAPluginActive && aAPropertyEnabled) {
        //check if any MFA policy is active
        var mfacontextGr = new GlideRecord("sys_mfa_policy_context");
        mfacontextGr.addEncodedQuery("default_policy=stepup_mfa_policy^stepup_mfa_policy.active=true^NQdefault_policy=stepdown_mfa_policy^stepdown_mfa_policy.active=true");
        mfacontextGr.query();
        if (mfacontextGr.next()) {
            var activeMFAPolicyConditionCount = 0;
            if (mfacontextGr.default_policy == "stepup_mfa_policy") {
                activeMFAPolicyConditionCount = getActivePolicyConditionCount(mfacontextGr.stepup_mfa_policy.decision_table);
            } else {
                activeMFAPolicyConditionCount = getActivePolicyConditionCount(mfacontextGr.stepdown_mfa_policy.decision_table);
            }
            if (activeMFAPolicyConditionCount > 0)
                count++;
        }
    }
    return count;
}

function getActivePolicyConditionCount(decision_table_sys_id) {
    var ga = new GlideAggregate("sys_auth_policy_condition");
    ga.addActiveQuery();
    ga.addQuery("decision_table", decision_table_sys_id);
    ga.addAggregate("COUNT", null);
    ga.query();
    if (ga.next()) {
        return ga.getAggregate('COUNT');
    }
    return 0;
}
