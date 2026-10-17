function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	
	if (newValue != 1) {
		turnReadOnlyOff();
		return;
	}
	
	var ga = new GlideAjax('RestrictedCallerAccessAJAX');
	ga.addParam('sysparm_name', 'getCallerAccessPolicy');
	ga.addParam('sysparm_table_id', g_form.getValue('target'));
	ga.getXML(act);
}

function act(response) {
	var answer = response.responseXML.documentElement.getAttribute("answer");
	if (answer == 1)
		turnReadOnlyOn();
	else
		turnReadOnlyOff();
}

function turnReadOnlyOn() {
	g_form.showFieldMsg('status', getMessage('Access is always allowed for tables under the Caller Tracking policy. The table policy must be Caller Restricted for access status changes to be effective.'), 'info', false);
	g_form.setReadOnly('status', true);
}

function turnReadOnlyOff() {
	g_form.hideFieldMsg('status');
	g_form.setReadOnly('status', false);
}
