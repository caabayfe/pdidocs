function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	var restricted = newValue.split(',');
	var mandatoryArray = g_form.getValue('mandatory_fields').split(',');
	var defaultArray = getDefaultFields();
	
	var result = findConflicts(restricted, mandatoryArray);
	if (result.length > 0) {
		g_form.hideFieldMsg('restricted_fields');
		g_form.showFieldMsg('restricted_fields', getMandatoryErrorMessage(result), 'error');
	}
	result = findConflicts(restricted, defaultArray);
	if (result.length > 0) {
		g_form.hideFieldMsg('restricted_fields');
		g_form.showFieldMsg('restricted_fields', getDefaultErrorMessage(result), 'error');
	}
}

function findConflicts(mandatoryArray, restrictedArray) {
	var result = [];
	for (var j = 0; j < mandatoryArray.length; j++)
		if (restrictedArray.indexOf(mandatoryArray[j]) != -1)
			result.push(mandatoryArray[j]);
	return result;
}

function getMandatoryErrorMessage(conflictFields) {
	return getErrorMessage(conflictFields, true);
}

function getDefaultErrorMessage(conflictFields) {
	return getErrorMessage(conflictFields, false);
}

function getErrorMessage(conflictFields, isMandatoryMsg) {
	var labels = $('ni.std_change_properties.restricted_fields.select_1').getElementsByTagName('option');
	if (!labels)
		return;
	for (var k = 0; k < conflictFields.length; k++)
		conflictFields[k] = getRestrictedFieldLabel(conflictFields[k], labels);
	var conflictingFields = conflictFields.join('\', \'');
	if(isMandatoryMsg)
		return new GwtMessage().getMessage("The field '{0}' is already in the Mandatory Change Request values list. Remove the field(s) from the mandatory or restricted field to continue", conflictingFields);
	return 	new GwtMessage().getMessage("The field '{0}' is already in the Default Values. Remove the field(s) from the default values or restricted field to continue", conflictingFields);
}

function getRestrictedFieldLabel(fieldId, labels) {
	for (var i = 0; i < labels.length; i++)
		if (fieldId == labels[i].value)
			return labels[i].text;
	return ''; 
}

function getDefaultFields() {
	var defaultArray = g_form.getValue('default_values').split('^');
	for (var i = 0; i < defaultArray.length; i++) {
		var field = defaultArray[i].split('=');
		if (field[0] != 'EQ') // End of query should be discarded
			defaultArray[i] = field[0];
	}
	return defaultArray;
}
