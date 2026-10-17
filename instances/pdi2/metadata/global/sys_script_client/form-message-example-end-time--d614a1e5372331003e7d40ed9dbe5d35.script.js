function onLoad() {
	if (!g_form.getValue("duration"))
		return;

	validateDurationGetExampleBreach(function(answer) {
		if (!answer)
			return;
		var answerObj = JSON.parse(answer);
		if (answerObj.durationMessage) {
			g_form.showFieldMsg("duration", answerObj.durationMessage, "error");
			g_user.setClientData('invalidDuration', true);
		}
		else {
			g_user.setClientData('invalidDuration', false);
			if (answerObj.breachTime)
				g_form.addInfoMessage(answerObj.breachTime, "example_breach_time");
		}
	});
}

// Do not remove from onLoad. This function is used by onChange client scripts to refresh the example
function getExampleSLABreachTime(callback) {
	if (g_form.getValue("duration_type") !== "")
		return;

	var ajax = new GlideAjax("SLADefinitionAJAX");
	ajax.addParam("sysparm_name", "getExampleBreachTime");
	ajax.addParam("sysparm_schedule", g_form.getValue("schedule"));
	var duration = g_form.getValue("duration") ? g_form.getValue("duration") : '0 00:00:00';
	ajax.addParam("sysparm_duration", duration);
	ajax.getXMLAnswer(function(answer) {
		if (callback)
			callback.call(this, answer);
	});
}

// Do not remove from onLoad. This function is used by onChange client scripts to validate the duration value against property settings
function validateDurationGetExampleBreach(callback) {
	if (g_form.getValue("duration_type") !== "")
		return;

	var ajax = new GlideAjax("SLADefinitionAJAX");
	ajax.addParam("sysparm_name", "validateDurationGetExampleBreach");
	ajax.addParam("sysparm_schedule", g_form.getValue("schedule"));
	var duration = g_form.getValue("duration") ? g_form.getValue("duration") : '0 00:00:00';
	ajax.addParam("sysparm_duration", duration);
	ajax.getXMLAnswer(function(answer) {
		if (callback)
			callback.call(this, answer);
	});
}
