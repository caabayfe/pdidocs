checkForValidValues();

function checkForValidValues() {
	current.value = Math.round(current.value * 100) / 100; // change to match platform storage value of 2 decimal
	var errMsg = "";
	if (valueIsNegative()) {
		errMsg = gs.getMessage("The value must be greater than or equal to 0");
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
	
	if (valueIsDuplicate()) {
		errMsg = gs.getMessage("The value must not match an existing value");
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}

	if(!(new AssessmentUtils()).isInteger(current.value.toString())){
		errMsg = gs.getMessage("The value must be an Integer");
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
}

function valueIsNegative() {
	// Value cannot be negative when updating an existing record
	if (current.value < 0 && current.operation() == "update")
		return true;
	
	// Value cannot be negative unless inserting when user submits a survey with N/A selected
	if (current.value < 0 && current.value != -1  && current.operation() == "insert")
		return true;

	return false;
}

function valueIsDuplicate() {
	// Duplicate values are not allowed because reporting will not show correct information
	if (current.value == previous.value)
		return false; // User changed a different part of the same record
	
	var defRecord = new GlideRecord('asmt_template_definition');
	defRecord.addQuery('template', current.template);
	defRecord.addQuery('value', current.value);
	defRecord.setLimit(1);
	defRecord.query();
	
	return (defRecord.hasNext());
}
