(function executeRule(current, previous /*null when async*/ ) {

    var currPolicySysId = current.sys_id;
    var tableName = "sys_auth_policy_context";
    var allowOrStepUpField = "allow_policy";
    var denyOrStepDownField = "deny_policy";
    var contextRecord = fetchContextRecord(tableName, allowOrStepUpField, denyOrStepDownField);
    // If the Current Policy is not attached to Any of the Auth Policy Context (Pre/Post/ACR context) then check for the MFA Context
    if (contextRecord == null) {
        // MFA Context related details
        tableName = "sys_mfa_policy_context";
        allowOrStepUpField = "stepup_mfa_policy";
        denyOrStepDownField = "stepdown_mfa_policy";
        contextRecord = fetchContextRecord(tableName, allowOrStepUpField, denyOrStepDownField);
    }

	// If a context record is FOUND where the current Policy is actively referenced(i.e. being set as default Policy) then Don't allow to DELETE
    if (contextRecord != null) {
        var defaultPolicy = contextRecord.getValue("default_policy");
        // If the current policy is actively referenced in any of the policy_context record, then delete should be restricted.
        if (contextRecord.getValue(defaultPolicy) == currPolicySysId) {
            var contextLink = "/" + tableName +".do?sys_id=" + contextRecord.getUniqueValue();
            gs.addErrorMessage(gs.getMessage("Failed to delete the Authentication Policy '{0}' as it is referenced in one or more Policy Context(s). Please remove the reference(s) before deleting. <a target='_blank' href='{1}'>Click here to review.</a>", [current.name, contextLink]));
            current.setAbortAction(true);
        }
    }


	// Fetch the context record.
    function fetchContextRecord(tableName, allowOrStepUpField, denyOrStepDownField) {
        var glideRecord = new GlideRecord(tableName);
        var qc = glideRecord.addQuery(allowOrStepUpField, currPolicySysId);
        qc.addOrCondition(denyOrStepDownField, currPolicySysId);
        glideRecord.query();
        if (glideRecord.next()) {
            return glideRecord;
        }
        return null;
    }

})(current, previous);
