(function executeRule(current, previous /*null when async*/) {
	var table = current.inputs.table;
	var queryString = new GlideQueryString(table, current.inputs.field_values);
	queryString.deserialize();
	var terms = queryString.getTerms();
	var dependentFields = {};
	var td = GlideTableDescriptor.get(table);
	for (var i = 0; i < terms.size(); i++) {
		var term = terms.get(i);
		var field = term.getField() + "";
		if (gs.nil(field))
			continue;

		var ed = td.getElementDescriptor(field);
		if (ed) {
			var dependentField = ed.getDependent();
			if (!gs.nil(dependentField))
				dependentFields[field] = dependentField + "";
			else
				dependentFields[field] = "";
		}
	}

	var fieldList = getDependentFields(dependentFields);
	if (!gs.nil(fieldList)) {
		var message = gs.getMessage("Some fields have dependencies on other fields being set in this step. To keep your test stable, break out the following field(s) into a subsequent set values step: {0}.", fieldList);
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

	// get the list of fields that are dependent on other fields set in this step
	function getDependentFields(dependentFields) {
		var fields = Object.keys(dependentFields);
		var fieldsToMove = [];
		for (var i = 0; i < fields.length; i++) {
			var dependentField = dependentFields[fields[i]];
			if (!gs.nil(dependentField) && fields.indexOf(dependentField) != -1)
				fieldsToMove.push(fields[i]);
		}
		if (fieldsToMove.length == 0)
			return "";

		// not using array.join here because we want to use both comma and 'and' as concatenators
		var fieldList = fieldsToMove[0];
		for (var i = 1; i < fieldsToMove.length - 1; i++)
			fieldList += ", " + fieldsToMove[i];

		if (fieldsToMove.length > 1)
			fieldList += " " + gs.getMessage("and") + " " + fieldsToMove[fieldsToMove.length - 1];

		return fieldList;
	}
})(current, previous);
