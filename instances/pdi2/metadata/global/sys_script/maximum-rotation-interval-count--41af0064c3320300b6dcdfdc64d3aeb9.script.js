(function executeRule(current, previous /*null when async*/) {
	if (new OCRotaMember().rotaRepeatLimitExceeded(current))
		current.setAbortAction(true);
})(current, previous);
