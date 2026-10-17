(function executeRule(current, previous /*null when async*/) {
	var grACL = new GlideRecord('sys_security_acl');
	if (grACL.get(current.sys_security_acl)) {
		var regex = /^[a-z0-9._]+$/;
		if (grACL.condition != null && regex.test(grACL.condition)) {
			var msg = gs.getMessage('Invalid ACL Condition value: {0}', grACL.condition);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}

		if (grACL.applies_to != null && regex.test(grACL.applies_to)) {
			var msg = gs.getMessage('Invalid ACL Applies-To value: {0}', grACL.applies_to);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}

	}

})(current, previous);
