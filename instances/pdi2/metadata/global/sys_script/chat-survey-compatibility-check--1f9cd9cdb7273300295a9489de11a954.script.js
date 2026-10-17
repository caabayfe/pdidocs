(function executeRule(current, previous /*null when async*/) {

	var typeId = current.metric_type + '';
	var categoryCount = new global.ChatSurveyUtil().getCategoryCount(current.metric_type + '');
	if (categoryCount >= 1) {
		gs.addErrorMessage(gs.getMessage('For Chat Survey, all questions must belong to a single category'));
		current.setAbortAction(true);
	}

})(current, previous);
