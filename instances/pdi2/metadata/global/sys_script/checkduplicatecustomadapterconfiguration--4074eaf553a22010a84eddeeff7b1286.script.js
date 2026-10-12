(function executeRule(current, previous /*null when async*/) {

	
	var gr = new GlideRecord('sys_cs_custom_adapter_config');
	gr.addQuery('provider',current.provider);
	gr.addQuery('control_type',current.control_type);
	gr.addQuery('sub_type',current.sub_type);
	gr.query();
	if(gr.next()) {
		//allow update of an existing record
		if(current.isNewRecord()) {
		var existErrorMessage = gs.getMessage("A Similar custom adapter configuration is already present");
		gs.addErrorMessage(existErrorMessage);
		current.setAbortAction(true);
		
		}
	}

})(current, previous);
