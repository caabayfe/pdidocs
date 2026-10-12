answer = getRecordsCount();

function getRecordsCount() {
    var count = 0;
    var aAPluginActive = GlidePluginManager.isActive("com.snc.adaptive_authentication");
    var aAPropertyEnabled = GlideProperties.getBoolean("glide.authenticate.auth.policy.enabled");
    if (aAPluginActive && aAPropertyEnabled) {
        
        //check if any post-auth policy is active
        var postAuthcontextGr = new GlideRecord("sys_auth_policy_context");
        postAuthcontextGr.addEncodedQuery("sys_id=c3086c5773112010616ca9843cf6a7ff^default_policy=allow_policy^allow_policy.active=true^NQsys_id=c3086c5773112010616ca9843cf6a7ff^default_policy=deny_policy^deny_policy.active=true");
        postAuthcontextGr.query();
        if (postAuthcontextGr.next()) {
            var activePostAuthPolicyConditionCount = 0;
            if (postAuthcontextGr.default_policy == "allow_policy") {
                activePostAuthPolicyConditionCount = getActivePolicyConditionCount(postAuthcontextGr.allow_policy.decision_table);
            } else {
                activePostAuthPolicyConditionCount = getActivePolicyConditionCount(postAuthcontextGr.deny_policy.decision_table);
            }
            if (activePostAuthPolicyConditionCount > 0)
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
