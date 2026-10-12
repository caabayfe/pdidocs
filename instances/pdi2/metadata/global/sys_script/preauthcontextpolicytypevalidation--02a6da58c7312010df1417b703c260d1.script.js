(function executeRule(current, previous /*null when async*/ ) {

    var defaultPolicy = current.default_policy;

    var policyId = current.allow_policy;

    if (defaultPolicy == 'deny_policy')
        policyId = current.deny_policy;

    isPolicyTypeAllowed(policyId);

    function isPolicyTypeAllowed(authPolicy) {
        var policyType = authPolicy.type;
        if (policyType == 'post_auth') {
            gs.addErrorMessage(gs.getMessage("Any policy bound to 'Pre Authentication Policy Context' doesn't allow filter criteria other than the {0}, {1} and {2}. Kindly update the policy conditions or use a different policy that uses {0} criteria, {1} and {2}.", ["IP Filter", "Trusted Mobile App Filter", "Location Based Filter"]));
            current.setAbortAction(true);
            return;
        }
    }

    /*
		Validate for the Default Policy field changes or Validate for the Policy changes only if the policy reference changes
		This handles below two use cases: 
		1) Default Policy field changes from allow to deny or vice versa in Pre-Auth Context
		2) Policy Reference change in Pre-Auth context
    */
    if (current.default_policy.changes() || (defaultPolicy == 'allow_policy' && current.allow_policy.changes()) || (defaultPolicy == 'deny_policy' && current.deny_policy.changes())) {
        // send the default and the corresponding policy
        try {
            var isValid = SNC.AuthPolicyIPUtil.validateDefaultPolicyOptionOrPolicyRefChange(defaultPolicy, policyId);
            // abort if session will be blocked
			if (!isValid) {
                gs.addErrorMessage(gs.getMessage("Current session may get blocked by the attached Authentication policy due to this operation. Aborting the operation."));
                current.setAbortAction(true);
				return;
            }
        } catch (ex) {
            message = "Exception while updating the Default Policy or the Policy references in Pre-Auth Context.";
            message += ex.message;
            gs.error(message);
        }
        
    }

})(current, previous);
