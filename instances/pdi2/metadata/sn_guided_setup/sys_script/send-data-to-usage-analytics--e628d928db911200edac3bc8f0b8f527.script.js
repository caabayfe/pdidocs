(function executeRule(current, previous /*null when async*/) {
	var util = new GuidedSetupUtilSNC();
	var canSendBestPracticeDataToAnalytics = false; // gsw_change_log records content-group as best practice, but we don't want content-group to be marked as best practice, since only few of it's children are accepted as best practice
	if (current.type == util.LOG_TYPE.BEST_PRACTICE_ACCEPTED) {
		var contentGr = current[util.ATTR_CONTENT].getRefRecord();
		if (contentGr.getValue(util.ATTR_SYS_CLASS_NAME) != util.TABLE_CONTENT_GROUP) {
			canSendBestPracticeDataToAnalytics = true; // send only best practice accepted content-information to analytics
		}
	}
	if (current.type == util.LOG_TYPE.VISITED || current.type == util.LOG_TYPE.COMPLETED || current.type == util.LOG_TYPE.UNCOMPLETED || current.type == util.LOG_TYPE.DEACTIVATED || current.type == util.LOG_TYPE.REACTIVATED || canSendBestPracticeDataToAnalytics) {
		new GuidedSetupUsageAnalyticsSNC().sendDataToAnalytics(current);
	}

})(current, previous);
