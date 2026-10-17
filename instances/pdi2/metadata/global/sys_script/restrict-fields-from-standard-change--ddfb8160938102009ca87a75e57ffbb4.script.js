(function executeRule(current, previous /*undefined when async or display*/) {
    //If action is insert then reapply the readonly fields from the template as fields could be edited via the browser console.
    //Unable to check if the fields have changes because on the insert the changes are from the template and are valid changes.
	if (current.operation() === "insert")
		new StdChangeUtils().reapplyReadonlyTemplateFields(current);

	//If action is update then check that none of the read only fields have been edited and if they have then abort the action
	//and notify the user of the fields that cannot be edited.
	else if (current.operation() === "update") {
		var fieldNames = new StdChangeUtils().getReadOnlyFields();
		var modifiedFields = [];

		for (var i = 0; i < fieldNames.length; i++) {
			if(current[fieldNames[i]].changes())
				modifiedFields.push(current[fieldNames[i]].getLabel());
		}

		if (modifiedFields.length > 0) {
			gs.addErrorMessage(gs.getMessage("Fields {0} populated from a Standard Change Template cannot be modified.", modifiedFields.toString()));
			current.setAbortAction(true);
		}
	}
})(current, typeof previous != 'undefined' ?  previous : null);
