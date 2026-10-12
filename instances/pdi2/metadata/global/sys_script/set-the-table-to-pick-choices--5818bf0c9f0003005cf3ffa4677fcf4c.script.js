(function executeRule(current, previous /*null when async*/ ) {

	var tableChoiceUtils = new TableChoiceUtils(current.state_model.table);
	g_scratchpad.stateChoices =  tableChoiceUtils.getChoicesForField('state');

})(current, previous);
