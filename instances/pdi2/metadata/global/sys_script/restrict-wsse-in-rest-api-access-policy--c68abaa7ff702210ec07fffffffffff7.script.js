(function executeRule(current, previous /*null when async*/) {
	if(current.inbound_auth_profile && current.inbound_auth_profile.sys_class_name == 'http_body_auth') {
		gs.addErrorMessage(gs.getMessage("WSSE authentication profiles are not applicable for REST API Access Policies. Please select a valid authentication profile before saving the record."));
		current.setAbortAction(true);
	}

})(current, previous);
