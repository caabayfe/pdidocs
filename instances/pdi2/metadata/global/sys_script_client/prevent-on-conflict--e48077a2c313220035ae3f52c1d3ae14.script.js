function onSubmit() {
	var mandatoryArray = g_form.getValue('mandatory_fields').split(',');
	var restrictedArray = g_form.getValue('restricted_fields').split(',');
	var defaultArray = getDefaultFields();
	for (var i = 0; i < mandatoryArray.length; i++) {
		if (restrictedArray.indexOf(mandatoryArray[i]) != -1) {
			g_form.flash('mandatory_fields', '#FFFACD', -4);
			g_form.flash('restricted_fields', '#FFFACD', -4);
			g_form.submitted = false; //Make sure dirty form still works
			return false; //Abort the submission
		}
		if (restrictedArray.indexOf(defaultArray[i]) != -1) {
			g_form.flash('default_values', '#FFFACD', -4);
			g_form.flash('restricted_fields', '#FFFACD', -4);
			g_form.submitted = false; //Make sure dirty form still works
			return false; //Abort the submission
		}
	}
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
