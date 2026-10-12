function transform(input) {
    var isAuthPolicyEnabledOnce = false;
    if (GlidePluginManager.isActive('com.snc.adaptive_authentication')) {
        // check if the property glide.authenticate.auth.policy.enabled is set to true at least once
        var gr = new GlideRecord('sys_audit');
        gr.addEncodedQuery('documentkey=47a63d6373121010616ca9843cf6a7c2^newvalue=true');
        gr.query();
        if (gr.hasNext()) {
            isAuthPolicyEnabledOnce = true;
        }
    }
    return {
        'isAuthPolicyEnabledOnce': isAuthPolicyEnabledOnce
    };
}
