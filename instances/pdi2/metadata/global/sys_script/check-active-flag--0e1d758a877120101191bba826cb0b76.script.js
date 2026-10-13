(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	
	var gr = new GlideRecord('piwb_model');
	gr.addQuery('usecase', current.getUniqueValue());
	gr.query();
	
	if(gr.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("Use case has models, it cannot be de-activated"));
		current.setAbortAction(true);
		return;
	}
		

})(current, previous);
