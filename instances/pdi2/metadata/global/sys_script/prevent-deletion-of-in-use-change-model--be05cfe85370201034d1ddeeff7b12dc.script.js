(function executeRule(current, previous /*null when async*/) {

	var changeGr = new GlideRecord("change_request");
	changeGr.addQuery("chg_model", current.getUniqueValue());
	changeGr.setLimit(1);
	changeGr.query();
	
	if (changeGr.next()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("In use Change Models cannot be deleted"));
	}

})(current, previous);
