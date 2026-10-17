(function executeRule(current, previous /*null when async*/) {
	var limit = GlidePropertiesDB.get('password_reset.history.limit', 10);
	
	if(isNaN(current.value)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The {0} parameter value must be an integer.', '\'password_history_limit\''));
		return;
	}
	
	if (parseInt(current.value) > limit || parseInt(current.value) <= 0 || (current.value % 1 !== 0)) {
		current.setAbortAction(true);
		var password_history_limit = '\'password_history_limit\'';
		var message = gs.getMessage('The value of the {0} parameter must be an integer greater than 0 and less than or equal to {1}.', [password_history_limit,limit]);
		gs.addErrorMessage(message);
		return;
	}	
})(current, previous);
