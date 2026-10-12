function validate(value, fieldName) {
	if(!NOW.sp)
		return true;

	var validator = function(callback) {
		if (!value) { 
			callback(fieldName, true);
			return;
		}

		// disable validation for certain tables
		var tableName = g_form.getTableName();
		if (tableName === 'sys_ui_script' || tableName === 'sys_script_client' || tableName === 'sys_script_validator') {
			callback(fieldName, true);
			return;
		}
		
		var ajax = new GlideAjax('XMLValidator');
		ajax.addParam('sysparm_name', 'validate');
		ajax.addParam('sysparm_xml', value);
		ajax.getXMLAnswer(function(answer) {
			if (answer === null) {
				callback(fieldName, true);
			} else {
				callback(fieldName, false, answer);
			}
		});
	};

	var executor = g_ui_scripts['sp.validation.executor']();
	return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
}
