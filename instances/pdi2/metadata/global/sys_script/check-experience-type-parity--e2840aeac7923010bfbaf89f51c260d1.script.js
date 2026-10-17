(function executeRule(current, previous /*null when async*/) {
	var mismatchedFields = [];
	if (!current.activity_definition.nil() &&
		current.activity_definition.activity_type != current.type)
		mismatchedFields.push(current.activity_definition.getLabel());
	if (!current.activity_ui.nil() &&
		current.activity_ui.experience_type != current.type && !current.activity_ui.experience_type.nil())
		mismatchedFields.push(current.activity_ui.getLabel());
	
	if (!mismatchedFields.length)
		return;
	
	gs.addErrorMessage(
		gs.getMessage(
			"Activity Override Experience Type is not compatible with the following: {0}.",
			mismatchedFields.join(', ')
		)
	);
	current.setAbortAction(true);
})(current, previous);
