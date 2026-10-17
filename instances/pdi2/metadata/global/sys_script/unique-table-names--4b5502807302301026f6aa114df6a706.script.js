(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("cmdb_dependent_ci_class_exclusion");
	gr.addQuery("ci_class", current.ci_class);
	gr.query();
	
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This table is already marked for exclusion."));
	}

})(current, previous);
