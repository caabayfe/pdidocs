(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_nlu_model");
	gr.addQuery('primary_model', current.primary_model);
	gr.addQuery('language', current.language);
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage(" A secondary model already exists for the selected language"));
		current.setAbortAction(true);
	}

})(current, previous);
