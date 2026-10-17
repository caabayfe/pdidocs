function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	var currentRoster = g_form.getValue('current_roster');
	var fromDate = g_form.getValue('from_date');
	
	var sourceUserCallback = callback.bind({'fieldName': 'source_user'});
	var targetUserCallback = callback.bind({'fieldName': 'target_user'});

	validateMember('getRefQualByRoster', currentRoster, fromDate, sourceUserCallback);
	validateMember('getRefQualByRoster', currentRoster, fromDate, targetUserCallback);
}

function validateMember(glideFunction, currentRoster, fromDate, callbackFunction) {
	var ga = new GlideAjax('OnCallMemberUtilsAjax');
	ga.addParam('sysparm_name', glideFunction);
	ga.addParam('roster_sys_id', currentRoster);
	ga.addParam('from_date', fromDate);
	ga.getXMLAnswer(callbackFunction);
}

function callback(response) {
	updateFormFields(response, this.fieldName);
}

function updateFormFields(response, fieldName) {
	var prefixString = 'sys_idIN';
	var answer = response.substr(prefixString.length);
	answer = answer.split(',');
	if (answer.indexOf(g_form.getValue(fieldName)) == -1) {
		g_form.clearValue(fieldName);
	}
}
