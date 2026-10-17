(function executeRule(current, previous /*null when async*/ ) {

    var policyId = fetchDefaultPolicyReferencedInMFAContextRecord();

    //check if the policy is active
    if (isAuthPolicyRecordActive(policyId)) {
        gs.addErrorMessage(gs.getMessage("Restricting deactivation of Multi-Factor Authentication property as Adaptive Authentication Policy referenced in MFA Context is Active and may enforce MFA during User Login"));
        current.setAbortAction(true);
        return;
    }

    function isAuthPolicyRecordActive(policyId) {
        var glideRecord = new GlideRecord("sys_authentication_policy");
        glideRecord.addActiveQuery();
        glideRecord.addQuery("sys_id", policyId);
        glideRecord.query();
        if (glideRecord.next())
            return true;
        return false;
    }

    // get the default policy ref from the MFA context
    function fetchDefaultPolicyReferencedInMFAContextRecord() {
        var glideRecord = new GlideRecord("sys_mfa_policy_context");
        glideRecord.get('c4895d9373512010616ca9843cf6a79f');
        if (glideRecord.isValidRecord()) {
            var defaultPolicy = glideRecord.getValue("default_policy");
            return glideRecord.getValue(defaultPolicy);
        }
        return null;
    }


})(current, previous);
