(function executeRule(current, previous /*null when async*/) {
	var userName = current.credentials.user_name;
	var message;
	if(GlideStringUtil.nil(userName)) {
		message = gs.getMessage("Credential does not contain a user name in the user name field");
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
	
	var gr = new GlideRecord("em_snmp_to_credentials");
	gr.addQuery("snmp", current.snmp);
	gr.addQuery("credentials", current.credentials);
	gr.query();
	if(gr.next()) {
		message = gs.getMessage("The same credentials: {0} already exists", GlideStringUtil.escapeHTML(gr.credentials.name));
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
	
	
	gr = new GlideRecord("em_snmp_to_credentials");
	gr.addQuery("snmp", current.snmp);
	gr.addQuery("credentials", "!=",  current.credentials);
	gr.addQuery('credentials.user_name', userName);
	gr.query();
	if(gr.next()) {
		message = gs.getMessage("The same user name: {0} already exists in {1} credentials ", [GlideStringUtil.escapeHTML(userName), GlideStringUtil.escapeHTML(gr.credentials.name)]);		
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
})(current, previous);
