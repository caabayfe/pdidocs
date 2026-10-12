(function executeRule(current, previous /*null when async*/) {

	var	short_description = current.getValue('short_description');
	if (!short_description) {
		gs.addErrorMessage(gs.getMessage('Short Description should be defined'));
		current.setAbortAction(true);
		return;
	}
	
	var scope = gs.getCurrentApplicationScope();
	if (!scope)
		scope = 'global';
	
	var sanitized_desc = new SystemRunLevel().make_id_value(scope, short_description);
	if (!sanitized_desc) {
		gs.addErrorMessage(gs.getMessage('ID could not be generated from Scope and Short Description'));
		current.setAbortAction(true);
		return;
	}
	current.setValue("id", sanitized_desc);

		
})(current, previous);
