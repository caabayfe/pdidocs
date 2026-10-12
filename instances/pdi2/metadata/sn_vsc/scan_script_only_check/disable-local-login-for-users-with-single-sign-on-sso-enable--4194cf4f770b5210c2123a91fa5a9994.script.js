(function(finding) {

    var at_risk;

    // Count of Active Users with Password Set
    var activeUsersWithPasswordSet = countRecords('sys_user', 'active=true^user_password!=');

    // ACR enabled
    var totalAcrUsersCount = 0;

    var isAcrEnabled = gs.getProperty('glide.sso.acr.enabled', 'false') === 'true';
    var ssoEnabled = gs.getProperty('glide.authenticate.multisso.enabled', 'false') === 'true';

    if (isAcrEnabled && ssoEnabled)
        totalAcrUsersCount = countTotalAcrUsers();

    //Mark an instance is at risk if at least one active user is present with password set.
    if (activeUsersWithPasswordSet > 0) {
        at_risk = true;
    }
    //Mark an instance is not at risk if ACR is enabled
    if (totalAcrUsersCount > 0) {
        at_risk = false;
    }

    // Confirm SSO is enabled
    if (ssoEnabled) {
        // Finally, we might have a finding!
        if (at_risk == true) {
            finding.increment();
        }
    }

})(finding);

function getTableRecord(tableName, encodedQuery) {

    var gr = new GlideRecord(tableName);
    if (gr.isValid()) {
        if (encodedQuery != null && encodedQuery.length != 0)
            gr.addEncodedQuery(encodedQuery);
        gr.query();
        if (gr.next())
            return gr;
    }
    return null;
}

function countRecords(tableName, encodedQuery) {

    var count = 0;
    var gr = new GlideAggregate(tableName);
    if (gr.isValid()) {
        gr.addAggregate('COUNT');
        if (encodedQuery != null && encodedQuery.length != 0)
            gr.addEncodedQuery(encodedQuery);

        gr.query();
        if (gr.next())
            count = gr.getAggregate('COUNT');
    }
    return count;
}

//Count total number of ACR users if ACR property is enabled and has an active policy attached with input policy condition.

function countTotalAcrUsers() {
    var acrPolicyContext = getTableRecord('sys_auth_policy_context', 'name=SSO - ACR Context');
    if (!acrPolicyContext)
        return 0;
    var defaultPolicy = acrPolicyContext.getValue('default_policy');
    var policyType = defaultPolicy === 'deny_policy' ? 'deny_policy' : 'allow_policy';
    var sysPolicyValue = acrPolicyContext.getValue(policyType);

    var authPolicy = getTableRecord('sys_authentication_policy', 'sys_id=' + sysPolicyValue + '^active=true');
    if (!authPolicy)
        return 0;
    var decisionTableSysId = authPolicy.getValue('decision_table');
    var conditionExists = getTableRecord('sys_auth_policy_condition', 'decision_table=' + decisionTableSysId);
    if (!conditionExists)
        return 0;
    totalAcrUsersCount = countRecords('acr_user', 'account_recovery_enabled=true');
    return totalAcrUsersCount;
}
