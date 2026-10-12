(function executeRule(current, previous /*null when async*/) {

	var ldapServer = current.getValue("server");
	// check for the uniqueness of RDN value.
	var msgUniqueness = gs.getMessage("OU definition with same RDN & Filter value associated to the table already exists under current LDAP Server Config.");

	var ouConfGR = new GlideRecord("ldap_ou_config");
	ouConfGR.addQuery("server", ldapServer);
	ouConfGR.addQuery("active" , true);	
	ouConfGR.addQuery("ou", current.getValue("ou"));
	ouConfGR.addQuery("sys_id", "!=", current.getUniqueValue());
	ouConfGR.addQuery("table", current.getValue("table"));
	ouConfGR.addQuery("filter",current.getValue("filter"));
	ouConfGR.query();
	
	if (ouConfGR.getRowCount() > 0 ){
			gs.addErrorMessage(msgUniqueness);
			current.setAbortAction(true);
			return false;
	}
	
	return true;

})(current, previous);
