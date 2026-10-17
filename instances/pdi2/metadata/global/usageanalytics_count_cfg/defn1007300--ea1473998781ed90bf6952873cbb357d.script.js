answer = getRecordsCount();

function getRecordsCount() {
    var count = 0;
    var aAPluginActive = GlidePluginManager.isActive("com.snc.adaptive_authentication");
    var aAPropertyEnabled = GlideProperties.getBoolean("glide.authenticate.auth.policy.enabled");
    if (aAPluginActive && aAPropertyEnabled) {
        
        //check if any pre-auth policy is active
        var preAuthcontextGr = new GlideRecord("sys_auth_policy_context");
        preAuthcontextGr.addEncodedQuery("sys_id=62c7e85773112010616ca9843cf6a78e^default_policy=allow_policy^allow_policy.active=true^NQsys_id=62c7e85773112010616ca9843cf6a78e^default_policy=deny_policy^deny_policy.active=true");
        preAuthcontextGr.query();
        if (preAuthcontextGr.next()) {
            var activePreAuthPolicyConditionCount = 0;
            if (preAuthcontextGr.default_policy == "allow_policy") {
                activePreAuthPolicyConditionCount = getActivePolicyConditionCount(preAuthcontextGr.allow_policy.decision_table);
            } else {
                activePreAuthPolicyConditionCount = getActivePolicyConditionCount(preAuthcontextGr.deny_policy.decision_table);
            }
            if (activePreAuthPolicyConditionCount > 0)
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
