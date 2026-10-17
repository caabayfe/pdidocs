(function executeStep(inputs, outputs, stepResult) {
	var userId = inputs.user;
	if (gs.nil(userId)) {
		stepResult.setOutputMessage(gs.getMessage("The '{0}' input variable was not specified",
												  'user'));
        stepResult.setFailed();
		return;
	}
    var query = new GlideRecord(inputs.user.getReferenceTable());
    if (!query.get(userId)) {
        stepResult.setOutputMessage(gs.getMessage("No user found with sys_id '{0}'", userId));
        stepResult.setFailed();
		return;
    }
	
	stepResult.setSuccess();
	outputs.value = query.name;
	
	if (gs.nil(query.name)) {
        stepResult.setOutputMessage(gs.getMessage("User with sys_id '{0}' had no name", userId));
        stepResult.setFailed();
		return;
	}
	
    if (!query.name.startsWith('A')) {
        stepResult.setOutputMessage(gs.getMessage("Expected user name '{0}' to start with 'A'",
												  query.name));
        stepResult.setFailed();
		return;
    }
}(inputs, outputs, stepResult));
