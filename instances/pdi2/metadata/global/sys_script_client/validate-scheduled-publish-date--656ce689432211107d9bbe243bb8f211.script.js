function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	var TWENTY_FOUR_HOUR_IN_MILLISECONDS = 86400000;
	var ajax = new GlideAjax('KBAjax');
	ajax.addParam('sysparm_type', 'getGlideDateTime');
	ajax.getXML(processResponse);

	function processResponse(response){
		var glideDateTime = response.responseXML.documentElement.getAttribute('answer');
		var currentDateTime = getDateFromFormat(glideDateTime, g_user_date_time_format);
		var scheduledPublishedDateTime = getDateFromFormat(newValue, g_user_date_time_format);
		var publishTimeDiff = (scheduledPublishedDateTime - currentDateTime);
		if (publishTimeDiff < TWENTY_FOUR_HOUR_IN_MILLISECONDS) {
			g_form.showFieldMsg('scheduled_publish_date', getMessage('The Scheduled Published Date must be set at least 24 hr after the current date.'), 'error');
			return false;
		}

		return true;
	}
}
