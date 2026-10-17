function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var tableValue = g_form.getValue('table');
	var tableDisplayValue = g_form.getOption('table', tableValue).text;
	
	tableDisplayValue = tableDisplayValue.replace(/\[(.+?)\]/g, "");// remove the part of "[xxx]" from original text
	tableDisplayValue = tableDisplayValue.trim();// remove head and tailing spaces
	
	g_form.setValue('label', tableDisplayValue);
}
