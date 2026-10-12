function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	var nextAction = new GlideAjax('CalculateNextStartAndEnd');
	nextAction.addParam('sysparm_name', 'getNextAction');
	nextAction.addParam('sysparm_calendar_id', g_form.getValue('business_calendar'));
	nextAction.addParam('sysparm_run_type', g_form.getValue('run_type'));
	nextAction.addParam('sysparm_calendar_name', g_form.getDisplayBox('business_calendar').value);
    nextAction.addParam('sysparm_offset_type', g_form.getValue('offset_type'));
    nextAction.addParam('sysparm_offset', g_form.getValue('offset'));

	nextAction.getXMLAnswer(printMessages);
	
	function printMessages(answer) {
		g_form.addInfoMessage(answer);
	}
}
