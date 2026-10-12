function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	var mandatoryArray = newValue.split(',');
	var restricted = g_form.getValue('restricted_fields').split(',');
	var result = findConflicts(mandatoryArray, restricted);
	
	if (result.length > 0) {
		g_form.hideFieldMsg('mandatory_fields');
		g_form.showFieldMsg('mandatory_fields', getErrorMessage(result), 'error');
	}
}

function findConflicts(mandatoryArray, restrictedArray) {
	var result = [];
	for (var j = 0; j < mandatoryArray.length; j++)
		if (restrictedArray.indexOf(mandatoryArray[j]) != -1)
			result.push(mandatoryArray[j]);
	return result;
}

function getErrorMessage(conflictFields) {
	var labels = $('ni.std_change_properties.mandatory_fields.select_1').getElementsByTagName('option');
	if (!labels)
		return;
	for (var k = 0; k < conflictFields.length; k++)
		conflictFields[k] = getMandatoryFieldLabel(conflictFields[k], labels);
	var conflictingFields = conflictFields.join('\', \'');
	if (conflictFields.length > 1)
		return new GwtMessage().getMessage("The fields '{0}' are already in the Restricted Change Request values list. Remove the field(s) from the mandatory or restricted field to continue", conflictingFields)
	return new GwtMessage().getMessage("The field '{0}' is already in the Restricted Change Request values list. Remove the field(s) from the mandatory or restricted field to continue", conflictingFields);
}

function getMandatoryFieldLabel(fieldId, labels) {
	for (var i = 0; i < labels.length; i++)
		if (fieldId == labels[i].value)
			return labels[i].text;
	return ''; 
}
