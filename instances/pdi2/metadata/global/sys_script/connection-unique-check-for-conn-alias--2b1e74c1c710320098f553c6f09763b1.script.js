(function executeRule(current, previous /*null when async*/) {	
	// check the connection handle is set		
	var connAlias = current.getValue("connection_alias");
	if(gs.nil(connAlias)) {
		var msgAliasMandatory = gs.getMessage("Connection alias cannot be empty");	
		gs.addErrorMessage(msgAliasMandatory);
		current.setAbortAction(true);
		return false;
	}
	
	// check for the uniqeness of Connection alias within a domain, Active, and Connection Type
	var msgUniqeness = gs.getMessage("Connection alias and Domain combination for an active record already exists");
	var domain = current.getValue("sys_domain");
	
	var connGR = new GlideRecord("sys_connection");
	connGR.addQuery("connection_alias", connAlias);
	connGR.addQuery("sys_domain", domain);
	connGR.addQuery("active" , true);	
	connGR.addQuery("sys_id", "!=", current.getUniqueValue());
	connGR.query();
	
	if (connGR.getRowCount() > 0){
			gs.addErrorMessage(msgUniqeness);
			current.setAbortAction(true);
			return false;
	}
	
	return true;
})(current, previous);
