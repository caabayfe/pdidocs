function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;

	var value = g_form.getValue('value');
	// If value is already set, we don't change it automatically here.
	if (value && value != '' && !g_form.isNewRecord())
		return;

	var newValueFromLabel = createValueFromLabel(newValue);
	g_form.setValue('value', newValueFromLabel);
}

function createValueFromLabel(label) {
	var choiceValue = label.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	// Compact any multiple sequential underscores
	while (choiceValue.indexOf("__") != -1) {
		choiceValue = choiceValue.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (choiceValue != '' && choiceValue.charAt(choiceValue.length - 1) == '_') {
		choiceValue = choiceValue.substring(0, choiceValue.length - 1);
	}

	return choiceValue;
}
