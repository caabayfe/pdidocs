(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("cmdb_dependency_impact_direction");
	gr.addQuery("direction", current.getValue("direction"));
	gr.addQuery("child_class", current.getValue("child_class"));
	gr.addQuery("parent_class", current.getValue("parent_class"));
	gr.addQuery("type", current.getValue("type"));
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.setLimit(1);
	gr.query();

	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Cannot create duplicated configuration"));
		current.setAbortAction(true);
	}

})(current, previous);
