(function executeRule(current, previous /*null when async*/) {
	var actionItem = new GlideRecord("sys_sg_write_back_action_item");
	actionItem.addQuery("parameter_screen", current.parameter_screen);
	actionItem.query();
	var message = "";
	
	while(actionItem.hasNext()) {
		actionItem.next();
		var varInTemplate = actionItem.template.search("{{Variable: " + previous.name + "}}");

		if (varInTemplate > -1) {
			var name = actionItem.getValue("name");
			var sysId = actionItem.getUniqueValue();

			if(!message) message = "Updated variable is used in action item(s): ";
			message += name + " (sys id: " + sysId + "), ";
		}
	}

	if(message){
		message = message.substring(0, message.length - 2);
		gs.addErrorMessage(message);
	}
})(current, previous);
