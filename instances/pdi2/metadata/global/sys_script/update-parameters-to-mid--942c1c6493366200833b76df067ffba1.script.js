(function executeRule(current, previous /*null when async*/) {

	if (current.status == previous.status) { //status is started and hadn't changed
		var context = new MIDExtensionContext(current);
		context.updateParameters();		
	}
})(current, previous);
