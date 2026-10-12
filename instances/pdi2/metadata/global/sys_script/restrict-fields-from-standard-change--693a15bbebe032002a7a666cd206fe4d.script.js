(function executeRule(current, previous /*undefined when async or display*/) {
	
	var fieldNames = new StdChangeTaskUtils().getReadOnlyFields();
	var modifiedFields = [];

	for (var idx in fieldNames) {
		if(current[fieldNames[idx]].changes())
			modifiedFields.push(current[fieldNames[idx]].getLabel());
	}

	if(modifiedFields.length > 0){
		gs.addErrorMessage(gs.getMessage("Fields {0} populated from Standard Change Proposal cannot be modified.", modifiedFields.toString()));
		current.setAbortAction(true);
	}

})(current, typeof previous != 'undefined' ?  previous : null);
