function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	ScriptLoader.getScripts(['relative_path_cleaner.js'], function() {
		if (validateRelPathFormat(g_form, newValue))
			normalizeRelPath(g_form, newValue);
	});
}

function normalizeRelPath(form, newValue) {
	var normalized = normalizeRelativePath(newValue);
	var control = form.getControl('relative_path');
	control.value = normalized;
}

function validateRelPathFormat(form, newValue) {
	// if there are invalid url characters
	if (hasInvalidChars(newValue)) {
		form.showFieldMsg('relative_path',
			getMessage("Only the following characters are valid for the path: a-z, A-Z, 0-9, '-', '/', '{}', and '_'"),
			'error');
		return false;
	}
	
	// if there are unclosed curly braces
	if (hasUnclosedBraces(newValue)) {
		form.showFieldMsg('relative_path',
			getMessage("Path contains unclosed curly braces, for example '/{myvar' is invalid"),
			'error');
		return false;
	}
	
	// if there are nested curly braces
	if (hasNestedBraces(newValue)) {
		form.showFieldMsg('relative_path',
			getMessage("Nested path variables are not allowed, for example '/{myvar{nested}}' is invalid"),
			'error');
		return false;
	}
	
	// if there are slash characters nested in curly braces
	if (hasNestedSlashes(newValue)) {
		form.showFieldMsg('relative_path',
			getMessage("Slash characters cannot be nested in curly braces, for example '{myvar/abc}' is invalid"),
			'error');
		return false;
	}
	
	// if there are more than one set of curly braces per slash-delimited section of the URL
	if (hasMultiBracesPerSection(newValue)) {
		form.showFieldMsg('relative_path',
			getMessage("Only one path variable allowed per slash-delimited URL section, for example '/{myvar}_{abc}' is invalid"),
			'error');
		return false;
	}
	
	return true;
}
