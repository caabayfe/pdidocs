(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('em_alert_history');
	var isQueryValid = gr.isEncodedQueryValid(current.filter);

	if(!isQueryValid) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The filter defined on the table \'em_alert\' is being executed on the table \'em_alert_history\'. The filter fails because one of its fields does not exist in the table \'em_alert_history\'.'));
	}
})(current, previous);
