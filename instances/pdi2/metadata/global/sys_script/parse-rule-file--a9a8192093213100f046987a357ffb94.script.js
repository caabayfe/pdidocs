function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	var resultCount = {
		mapRule: 0,
		mapRuleFailed: 0,
		matchRule: 0,
		matchRuleFailed: 0,
		success:true
	};
	new EventRuleUtil().parseXML(current.rule_xml, current.name, resultCount);
	if(!isXMLParsedSuccessfully(resultCount)) {
		gs.addErrorMessage(current.name + ' sent by: ' + gs.getUser() + ' is corrupted.');
		gs.flushMessages();
		current.setAbortAction(true);
	}
	
	
}

function isXMLParsedSuccessfully(resultCountObj) {
	return resultCountObj.success;
}
