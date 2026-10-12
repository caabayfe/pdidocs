function validate(value, fieldName) {
	if (!NOW.sp)
		return true;

	var validator = function(callback) {
		var validator = g_ui_scripts['utils.validators.email']();
		if (value === null || value === '' || validator.isEmailValid(value) === true) { callback(fieldName, true); } 
		else { getMessage('Invalid email address', function(trnsErrMsg) { callback(fieldName, false, trnsErrMsg); }); }
	};

	var executor = g_ui_scripts['sp.validation.executor']();
	return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
