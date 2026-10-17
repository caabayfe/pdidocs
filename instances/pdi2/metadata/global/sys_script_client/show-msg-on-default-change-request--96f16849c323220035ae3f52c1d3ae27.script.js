function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	var defaultArray = getDefaultFields(newValue);
	var restricted = g_form.getValue('restricted_fields').split(',');

	var result = findConflicts(defaultArray, restricted);
	if (result.length > 0) {
		g_form.hideFieldMsg('default_values');
		g_form.showFieldMsg('default_values', getErrorMessage(result), 'error');
	}
}

function getDefaultFields(newValue) {
	var defaultArray = newValue.split('^');
	for (var i = 0; i < defaultArray.length; i++) {
		var field = defaultArray[i].split('=');
		if (field[0] != 'EQ') // End of query should be discarded
			defaultArray[i] = field[0];
	}
	return defaultArray;
}

function findConflicts(fieldsArray, restrictedArray) {
	console.log("[findConflicts]");
	var result = [];
	for (var j = 0; j < fieldsArray.length; j++)
		if (restrictedArray.indexOf(fieldsArray[j]) != -1)
			result.push(fieldsArray[j]);
	return result;
}

function getErrorMessage(conflictFields) {
	var map = getFieldsMap();
	for (var i = 0; i < conflictFields.length; i++)
		conflictFields[i] = map[conflictFields[i]];
	var conflictingFields = conflictFields.join('\', \'');
	var msg = new GwtMessage().getMessage("The field '{0}' is already in the Restricted Change Request values list. Remove the field(s) from the default or restricted field to continue", conflictingFields);
	if (conflictFields.length > 1)
		msg = new GwtMessage().getMessage("The fields '{0}' are already in the Restricted Change Request values list. Remove the field(s) from the default or restricted field to continue", conflictingFields);
	return msg;
}

// Create a map with field id as key and label as value from the restricted_fields list
function getFieldsMap() {
	var options = $("ni.std_change_properties.restricted_fields.select_1").getElementsByTagName("option");
	if (!options)
		return;
	var map = [];
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		var key = option.value + "";
		map[key] = option.text + "";
	}
	return map;
}
