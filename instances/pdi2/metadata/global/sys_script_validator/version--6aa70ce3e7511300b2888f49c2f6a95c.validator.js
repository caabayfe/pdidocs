function validate(value, fieldName) {
	if(!NOW.sp)
		return true;

	var containsOnlyChars = function(validChars, text) {
		for (var i = 0; i < text.length; i++) {
			var c = text.charAt(i);
			if (validChars.indexOf(c) === -1) { return false; } // not a match
		}

		return true;
	};

	var validator = function(callback) {
		if (value === null || value === '') { callback(fieldName, true); }
		else if (!containsOnlyChars('.0123456789', value) || value.indexOf('..') != -1 || value.endsWith('.')) {
			getMessage('Invalid version number. Must use dot-decimal notation.', function(trnsErrMsg) { 
				callback(fieldName, false, trnsErrMsg); 
			});
		} else { callback(fieldName, true); }
	};

	var executor = g_ui_scripts['sp.validation.executor']();
	return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
