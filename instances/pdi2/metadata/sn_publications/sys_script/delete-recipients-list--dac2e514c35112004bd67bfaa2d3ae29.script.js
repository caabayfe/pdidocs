(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord("sn_publications_publication");
	gr.addQuery('recipient_lists',current.sys_id);
	gr.setLimit(1);
	gr.query();
	if(gr.hasNext()){
		gs.addErrorMessage(gs.getMessage("Recipients list cannot be deleted when associated to a Publication"));
		current.setAbortAction(true);
	}

})(current, previous);
