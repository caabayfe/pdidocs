(function executeRule(current, previous /*null when async*/) {
	if (current.type == 1) { //instance type
		if (current.source == "" && current.header_name == "") {
			gs.addErrorMessage(gs.getMessage("Cannot save. Specify 'Source' and/or 'Header name' fields"));
			current.setAbortAction(true);
		}
	} else { //mid type
		var scriptName = current.mid_server_script_include.name;
		if (!scriptName.startsWith("TransformEvents_")) {
			gs.addErrorMessage(gs.getMessage("Cannot save. MID Server script name must start with 'TransformEvents_'"));
			current.setAbortAction(true);
		} else {
			if (current.name == "") {
				current.name = scriptName;
			}
		}
	}
	
	
	
})(current, previous);
