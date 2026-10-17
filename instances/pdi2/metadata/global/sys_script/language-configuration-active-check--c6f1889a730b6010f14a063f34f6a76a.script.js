(function executeRule(current, previous /*null when async*/) {

	//when state set to active check if there is at least 1 active language configuration
	var gr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	gr.addQuery('configuration', current.getUniqueValue());
	gr.addActiveQuery();
		
	gr.query();
	if (!gr.next()) {
		current.active = previous.active;
		gs.addErrorMessage(gs.getMessage('This Auto-Resolution configuration needs at least one active machine learning model for any language. Please set any language configuration record to active after successfully training the model.'));		
	}
					
})(current, previous);
