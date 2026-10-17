function validate(value, fieldName) {
	if (!(NOW.sp)) {
		return true;
	}
    var validator = function(callback) {
        var isInvalid = g_form.getField(fieldName).isInvalidDateFormat;
        if (isInvalid) {
            getMessage(' ', function(trnsErrMsg) {
                callback(fieldName, false, trnsErrMsg);
            });
        } else
            callback(fieldName, !isInvalid);
    };

    var executor = g_ui_scripts['sp.validation.executor']();
    return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
