(function executeRule(current, previous /*null when async*/) {
	var result = true;
	result = validateField(current, 'title') && result;
	result = validateFields(current, 'additional_fields') && result;
	result = validateField(current, 'description') && result;
	result = validateField(current, 'detail_title_field') && result;
	result = validateField(current, 'detail_link_field') && result;
	result = validateFields(current, 'detail_additional_fields') && result;

	if (!result)
		current.setAbortAction(true);
		
	function validateFields(currentGr, currentFieldName) {
		var isValid = true;
		var fieldNameString = currentGr.getValue(currentFieldName);
		if (!fieldNameString)
			return true;
		
		var fieldNameArray = fieldNameString.split(',');
		for(var i = 0; i < fieldNameArray.length; i ++) {
			var fieldName = fieldNameArray[i].trim();
			isValid = validateField(currentGr, currentFieldName, fieldName) && isValid;
		}

		return isValid;
	}
	
	function validateField(currentGr, currentFieldName, resultFieldName) {
		var fieldName = resultFieldName ? resultFieldName : currentGr.getValue(currentFieldName);
		if (!fieldName)
			return true;

		var resultTable = currentGr.getValue('table');
		var gr = new GlideRecord(resultTable);
		if (!gr.isValidField(fieldName)) {
			var currentFieldLabel = currentGr.getElement(currentFieldName).getED().getLabel();
			gs.addErrorMessage(gs.getMessage("{0} in {1} is not a valid field on {2} table", [fieldName, currentFieldLabel, resultTable]));
			return false;
		}

		return true;
	}
	
})(current, previous);
