(function executeRule(current, previous /*null when async*/) {
	var xmlPayload = new GlideXMLDocument();
	xmlPayload.parse(current.payload);
	var reschedule = xmlPayload.selectSingleNode('//results/@reschedule');
	if(JSUtil.notNil(reschedule)) {
		var gpa = new sn_ph.GlideProcessAutomation(current.source);
		gpa.reschedulePlanForIncompatibleMidEngine();
	}
})(current, previous);
