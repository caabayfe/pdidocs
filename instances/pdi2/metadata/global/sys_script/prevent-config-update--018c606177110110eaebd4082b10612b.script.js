(function executeRule(current, previous /*null when async*/) {
	
	var protectionType;
	
	if (current.update_protection != previous.update_protection) {
		protectionType = "update";
	} else if (current.delete_protection != previous.delete_protection) {
		protectionType = "delete";
	} else if (current.insert_protection != previous.insert_protection) {
		protectionType = "insert";
	}

	gs.addErrorMessage(gs.getMessage("The {0} protection for the table '{1}' cannot be changed.", [protectionType, current.table]));
	current.setAbortAction(true);

})(current, previous);
