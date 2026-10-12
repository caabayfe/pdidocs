(function executeRule(current, previous /*null when async*/ ) {

	// Audit the default Password Policy changes
    if (current.password_policy.changes()) {
        gs.info("PasswordPolicyAudit: Default Password Policy changed from '{0}' to '{1}' via the Local ServiceNow Instance credential store", previous.password_policy.getDisplayValue(), current.password_policy.getDisplayValue());
    }
	
	// Audit when the enable_password_policy field changes
    if (current.enable_password_policy.changesTo(false)) {
		var defaultPasswordPolicySysId = "3054afe6737a3300616ca9843cf6a735";
		gs.info("PasswordPolicyAudit: Passowrd Policy is disabled in the Local ServiceNow Instance credential store, Default Policy will be reset to Password Policy with sys_id: {0}", defaultPasswordPolicySysId);
    }
	
	if (current.enable_password_policy.changesTo(true)) {
		gs.info("PasswordPolicyAudit: Passowrd Policy is enabled in the Local ServiceNow Instance credential store, Default Policy will be set to Password Policy with sys_id: {0}", current.password_policy);
    }

})(current, previous);
