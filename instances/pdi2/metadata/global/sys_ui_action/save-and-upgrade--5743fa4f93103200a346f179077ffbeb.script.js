current.update();

var er = new SNC.EventRuleManager();
var problems = er.migrateRuleToJakartaAndAbove(current);

if (problems.length == 0 && current.getValue("rule_version") == 'jakarta') {
	var url = '/$em_event_rule_designer.do?sys_id=' + current.getUniqueValue();
	action.setRedirectURL(url);
} else {
	var logStr = "";
	if (problems[0] == "false") {
		logStr = gs.getMessage("Cannot view in event rule designer. Failed to upgrade the event rule.");
	} else {
		logStr = gs.getMessage("Cannot view in event rule designer. Unsupported fields in event rule filter: ");
		
		for(var i= 0; i < problems.length; i++) {
			logStr += problems[i];
			if (i+1<problems.length)
				logStr += ", ";
			else
				logStr += ".";
		}
	}
	
	var url = '/em_match_rule.do?sys_id=' + current.getUniqueValue();
	action.setRedirectURL(url);
	gs.addErrorMessage(logStr);
}
