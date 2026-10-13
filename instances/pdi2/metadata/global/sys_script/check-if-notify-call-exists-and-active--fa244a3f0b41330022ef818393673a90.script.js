(function executeRule(current, previous /*null when async*/) {
	if (current.notify_call) {
		var notifyCallGr = current.notify_call.getRefRecord();
		if (notifyCallGr.isValidRecord() && !notifyCallGr.active)
			current.active = false;
	}
})(current, previous);
