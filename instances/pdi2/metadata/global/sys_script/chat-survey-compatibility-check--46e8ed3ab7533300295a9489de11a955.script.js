(function executeRule(current, previous /*null when async*/) {

	var result = new global.ChatSurveyUtil().isMetricTypeSupported(current.sys_id);
	if (result.success)
		return;

	var messages = result.msg.split(";");
	messages.forEach(function(message) {
		gs.addErrorMessage(message);
	});
	current.setAbortAction(true);

})(current, previous);
