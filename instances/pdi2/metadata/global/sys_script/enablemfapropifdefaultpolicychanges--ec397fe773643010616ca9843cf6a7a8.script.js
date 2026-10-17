(function executeRule(current, previous /*null when async*/ ) {

	// get the default policy
    var defaultPolicy = current.default_policy;
	
    if (current.default_policy.changes() || (defaultPolicy == 'stepup_mfa_policy' && current.stepup_mfa_policy.changes()) || (defaultPolicy == 'stepdown_mfa_policy' && current.stepdown_mfa_policy.changes())) {
		
        // get the referenced policy record
        var policyRecord = current.stepup_mfa_policy;
        if (defaultPolicy == 'stepdown_mfa_policy')
            policyRecord = current.stepdown_mfa_policy;

        // If the referenced policy is active and MFA property is not enabled, then update the MFA Property
        if (policyRecord.active == true && policyRecord.type != 'any') {
            // enable the MFA
            var glideRecord = new GlideRecord("sys_properties");
            // 562c1882d713310091204187ed6103b9 - sysId of Property glide.authenticate.multifactor
            glideRecord.get("562c1882d713310091204187ed6103b9");
            if (glideRecord.isValidRecord()) {
                glideRecord.setValue("value", "true");
                glideRecord.update();
				gs.log("Property glide.authenticate.multifactor is updated to true.");
            }
        }
    }



})(current, previous);
