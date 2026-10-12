var gFormAlreadySubmitted = g_scratchpad.gFormAlreadySubmitted;
function onSubmit() {
	if (gFormAlreadySubmitted == true)
		return true;
	
	var numbers = [];
	if(g_form.getValue("home_phone"))
		numbers.push(g_form.getValue("home_phone"));
	if(g_form.getValue("mobile_phone"))
		numbers.push(g_form.getValue("mobile_phone"));
	if(g_form.getValue("work_phone"))
		numbers.push(g_form.getValue("work_phone"));
	
	if(numbers.length > 0) {
		var phoneValid = new GlideAjax("sn_hr_core.hr_CaseAjax");
		phoneValid.addParam("sysparm_name", "isPhoneNumberValid");
		phoneValid.addParam("sysparm_phoneNumber", numbers);
		phoneValid.getXML(function(response) {
		if (response) {
			var answer = response.responseXML.documentElement.getAttribute("answer");
			var results = JSON.parse(answer);
			if (results['valid']) {
				g_scratchpad.gFormAlreadySubmitted = true;
				g_form.save();
			}
			else
				g_form.addErrorMessage(getMessage("Error: Invalid phone number"));	
		}
	});
		return false;
	}
	else
		return true;
}
