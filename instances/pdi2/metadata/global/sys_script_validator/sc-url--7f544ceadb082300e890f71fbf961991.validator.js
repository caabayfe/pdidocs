function validate(value, fieldName) {
	var re = /(((ftp|http|https):\/\/)|(www\.))([-\w\.\/#$\?=+@&%_:;]+)/gi;
    if (!(NOW.sp)) {
        if (value == null || value == "") {
            return true;
        } else if (re.test(value)) {
            return true;
        } else {
            g_form.$private.setFieldInvalid(fieldName, true);
            getMessage('Invalid URL', function(trnsErrMsg) {
                g_form.showFieldMsg(fieldName, trnsErrMsg, 'error');
                g_form.$private.showFieldInvalidMsg(g_form);
            });
            return false;
        }
    }
    var validator = function(callback) {
        if (value == null || value == "") {
            callback(fieldName, true);
        } else if (re.test(value)) {
            callback(fieldName, true);
        } else {
            g_form.$private.setFieldInvalid(fieldName, true);
            getMessage('Invalid URL', function(trnsErrMsg) {
                g_form.$private.setFieldInvalid(fieldName, false);
                callback(fieldName, false, trnsErrMsg);
            });
        }
    };

    var executor = g_ui_scripts['sp.validation.executor']();
    return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
