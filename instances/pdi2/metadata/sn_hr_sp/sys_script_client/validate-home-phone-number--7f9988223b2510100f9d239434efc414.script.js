function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == '')
		return;
	
	g_form.hideErrorBox('home_phone');
	var number = g_form.getValue('home_phone');
	
	var phoneValid = new GlideAjax("sn_hr_core.hr_CaseAjax");
	phoneValid.addParam("sysparm_name", "isPhoneNumberValid");
	phoneValid.addParam("sysparm_phoneNumber", number);
	phoneValid.getXML(function(response) {
		if (response) {
			var answer = response.responseXML.documentElement.getAttribute("answer");
			var results = JSON.parse(answer);
			if (results['valid']) {
				g_scratchpad.validateNumberUpdate = true;
				g_form.setValue('home_phone', results['number']);
			} else
				g_form.showFieldMsg('home_phone', getMessage('Not a valid phone number'), 'error');		
		}
	});
}
