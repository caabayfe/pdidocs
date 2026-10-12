(function executeRule(current, previous /*null when async*/ ) {
    // check if the current Policy is attached to the MFA context
    var currPolicySysId = current.sys_id;
    var isReferenced = isPolicyReferencedInMFAContextRecord();

	// If this policy is referenced in the MFA context, then enable MFA Pro, if not already enabled
    if (isReferenced) {
        var glideRecord = new GlideRecord("sys_properties");
		// 562c1882d713310091204187ed6103b9 - sysId of Property glide.authenticate.multifactor
        glideRecord.get("562c1882d713310091204187ed6103b9");
        if (glideRecord.isValidRecord()) {
            glideRecord.setValue("value", "true");
            glideRecord.update();
			gs.log("Property glide.authenticate.multifactor is updated to true.");
        }
    }

    // Return True if the current policy is referenced in MFA Context otherwise False
    function isPolicyReferencedInMFAContextRecord() {
        var glideRecord = new GlideRecord("sys_mfa_policy_context");
        glideRecord.get('c4895d9373512010616ca9843cf6a79f');
        if (glideRecord.isValidRecord()) {
            var defaultPolicy = glideRecord.getValue("default_policy");
            // If the current policy is actively(i.e. set as Default) referenced in MFA context record, then update the MFA Property in not already enabled
            if (glideRecord.getValue(defaultPolicy) == currPolicySysId) {
                return true;
            }
        }
        return false;
    }

})(current, previous);
