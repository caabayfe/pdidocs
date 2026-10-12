(function executeRule(current, previous /*null when async*/) {
	
	if (current.ar_intent != previous.ar_intent) {
		var gr = new GlideRecord(current.getTableName());
		gr.addQuery('ar_intent', current.ar_intent);
		gr.addQuery('ar_configuration', current.ar_configuration);
		gr.query();

		if(gr.next()) {
			gs.addErrorMessage(gs.getMessage("Intent topic mapping already exists for this configuration's Auto-Resolution intent."));
			current.setAbortAction(true);
			gs.setRedirect(url);
		}
	}

})(current, previous);
