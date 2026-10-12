(function executeRule(current, previous /*null when async*/) {
	// Condition checking if the business application is hosted on any BA of type Platform Host.
	var gr = new GlideRecord('cmdb_ci_business_app');
	gr.addQuery('platform_host', current.getUniqueValue());
	gr.setLimit(1);
	gr.query();
	
	if(gr.next()){
		gs.addErrorMessage(gs.getMessage("There are Business Applications hosted on {0}, hence aborting the action.", current.name));
		current.setAbortAction(true);
	}

})(current, previous);
