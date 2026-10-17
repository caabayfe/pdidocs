reportFlowMidError();
function reportFlowMidError() {
	var xmlPayload = new GlideXMLDocument();
	xmlPayload.parse(current.payload);
	var error = xmlPayload.selectSingleNode('//results/@error');
	if(JSUtil.notNil(error)) {
		var gpa = new sn_ph.GlideProcessAutomation(current.source);
		gpa.reportMidError(error);
		current.state = "error";
	} else {
		current.state = "processed";
		
	}
	current.processed = gs.nowDateTime();
	current.update();
}
