(function executeRule(current, previous) {
	var scopeSysId = current.sys_scope;
	var aclSysId = current.security_acl;
	var aclGR = new GlideRecord("sys_security_acl");
	if (aclGR.get(aclSysId)) {
		var aclScope = aclGR.getValue("sys_scope");
		if (aclScope != scopeSysId) {
			gs.addErrorMessage(gs.getMessage("Current scope is different from acl scope, can not override"));
			current.setAbortAction(true);			
		}
	} else {
		gs.addErrorMessage(gs.getMessage("Invalid ACL value"));
		current.setAbortAction(true);
	}

})(current, previous);
