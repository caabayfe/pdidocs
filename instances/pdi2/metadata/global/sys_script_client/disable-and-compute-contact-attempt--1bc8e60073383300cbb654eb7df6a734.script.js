function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	computeContactAttempt();
}

// onload
if (!g_form.getValue('contact_attempt'))
	computeContactAttempt();
else
	disableContactAttempt();

function computeContactAttempt() {
	if (g_form.getValue('on_call_user_preference')) {
		var ga = new GlideAjax('OnCallUserPreferencesAjaxSNC');
		ga.addParam('sysparm_name', 'getHighestOrderContactAttemptAjax');
		ga.addParam('sysparm_user_preference_sys_id', g_form.getValue('on_call_user_preference'));
		ga.getXMLAnswer(function(response) {
			var highestOrderContactAttempt = parseInt(response);
			if (isNaN(highestOrderContactAttempt)) {
				g_form.setValue('contact_attempt', '');
				return;
			}
			g_form.setValue('contact_attempt', highestOrderContactAttempt + 1);
			disableContactAttempt();
		});
	}
}

function disableContactAttempt() {
	g_form.setReadOnly('contact_attempt', !!g_form.getValue('on_call_user_preference'));
}
