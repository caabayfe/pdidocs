(function executeRule(current, previous /*null when async*/) {
	
	var record = new GlideRecord(current.table);
	if (record.getElement(current.requester).getED().getInternalType() != "reference" || 
		record.getElement(current.requester).getReferenceTable() != "sys_user") {
		gs.addErrorMessage(gs.getMessage("Requester should be of type User."));
		current.setAbortAction(true);
		return;
	}

})(current, previous);
