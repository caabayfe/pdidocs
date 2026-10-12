(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("ml_autopurity_config");
	gr.addQuery('table',current.table);
	gr.query();
	if(gr.hasNext()){
		current.setAbortAction(true);
		var errMsg = gs.getMessage("One config per table is allowed");
		gs.addErrorMessage(errMsg);
	}

})(current, previous);
