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
