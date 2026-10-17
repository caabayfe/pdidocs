(function executeRule(current, previous /*null when async*/) {

	var prbGr = new GlideRecord("problem");
	prbGr.addQuery("prb_model", current.getUniqueValue());
	prbGr.setLimit(1);
	prbGr.query();
	
	if (prbGr.next()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("In use Problem models cannot be deleted"));
	}

})(current, previous);
