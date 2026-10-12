(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord()) {
		new KBInstrumentationSNC().initializeSessionInstrumentationValues(current.sys_id);
	}
})(current, previous);
