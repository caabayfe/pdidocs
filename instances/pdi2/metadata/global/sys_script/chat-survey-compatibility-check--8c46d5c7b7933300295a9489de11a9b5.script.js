(function executeRule(current, previous /*null when async*/) {

	var result = new global.ChatSurveyUtil().isMetricSupported(current);
	if (result.success)
		return;
	
	var messages = result.msg.split(";");
	messages.forEach(function(message) {
		gs.addErrorMessage(message);
	});
	current.setAbortAction(true);

})(current, previous);
