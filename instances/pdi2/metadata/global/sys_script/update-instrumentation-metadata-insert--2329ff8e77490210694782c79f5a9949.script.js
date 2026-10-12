(function executeRule(current, previous /*null when async*/) {
	var kbInstrumentation = new KBInstrumentationSNC();
	kbInstrumentation.recordGCFEvent(current, kbInstrumentation.operations.INSERT);
})(current, previous);
