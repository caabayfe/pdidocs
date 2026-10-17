(function executeRule(current, previous /*null when async*/) {

	if(current.content && current.content.parent) {
		new GuidedSetupUtilSNC().calculateParentProgress(current.content.parent, current.related_log_entry);
	}

})(current, previous);
