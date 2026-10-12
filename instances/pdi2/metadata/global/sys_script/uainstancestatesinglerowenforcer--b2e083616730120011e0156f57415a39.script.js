(function executeRule(current, previous /*null when async*/) {

	var gr = GlideRecord('ua_instance_state');
	gr.query();
	
	var rowCount = gr.getRowCount();
	
	// No more than 1 record is allowed in ua_instance_state table. 
	if (rowCount > 0) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("There can be only one instance state record."));
	}
		

})(current, previous);
