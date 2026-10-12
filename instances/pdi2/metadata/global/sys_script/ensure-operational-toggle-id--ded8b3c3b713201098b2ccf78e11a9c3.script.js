(function executeRule(current, previous /*null when async*/) {

	var	name = current.getValue('name');
	if (!name) {
		gs.addErrorMessage(gs.getMessage('Toggle name should be defined'));
		current.setAbortAction(true);
		return;
	}
	
	var scope = gs.getCurrentApplicationScope();
	if (!scope)
		scope = 'global';
	
	var sanitized_id = new SystemRunLevel().make_id_value(scope, name);
	if (!sanitized_id) {
		gs.addErrorMessage(gs.getMessage('Toggle ID could not be generated from Scope and Name'));
		current.setAbortAction(true);
		return;
	}
	current.setValue("id", sanitized_id);

	if (!current.getValue('short_description'))
		current.setValue('short_description', name);


})(current, previous);
