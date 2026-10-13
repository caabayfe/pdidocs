function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	var currentRoster = g_form.getValue('current_roster');
	var fromDate = g_form.getValue('from_date');
	
	var memberCallback = callback.bind({'fieldName': 'user'});

	validateMember('getRefQualByRoster', currentRoster, fromDate, memberCallback);
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
