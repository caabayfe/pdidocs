(function executeRule(current, previous /*null when async*/) {
	// check the uniqeness of Credential reference within a domain and Active only if it is not empty
	
	var msg = gs.getMessage("Credential and Domain combination for an active record already exists");
	
	var credential = current.getValue("credential");
	
	if (JSUtil.notNil(credential)) {
		var domain = current.getValue("sys_domain");		
		var connGR = new GlideRecord("sys_connection");
		connGR.addQuery("credential", credential);
		connGR.addQuery("sys_domain", domain);
		connGR.addQuery("active" , true);		
		connGR.query();
		
		while(connGR.next()) {
			if(connGR.getUniqueValue() !== current.getUniqueValue()) {
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return false;
			}
		}
	}
	return true;
})(current, previous);
