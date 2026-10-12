(function executeRule(current, previous /*null when async*/) {
	var model = new STTRMModel(current.sttrm_model.getRefRecord());

	var changeGr = new GlideRecord("change_request");
	changeGr.addQuery("chg_model", current.getValue("sttrm_model"));
	changeGr.addQuery(model.getStateFieldName(), current.getValue("state_value"));
	changeGr.setLimit(1);
	changeGr.query();
	
	if (changeGr.next()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("In use states cannot be deleted"));
	}
})(current, previous);
