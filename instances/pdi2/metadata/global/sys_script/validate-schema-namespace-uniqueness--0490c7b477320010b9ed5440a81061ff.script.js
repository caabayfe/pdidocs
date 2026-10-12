(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideAggregate("sys_graphql_schema");
	gr.addQuery("namespace", current.namespace);
	gr.addQuery("application_namespace", current.application_namespace);
	gr.addAggregate("COUNT");
	gr.query();
	if ((gr.next()) && (gr.getAggregate('COUNT') > 0)) {
		gs.addErrorMessage(gs.getMessage("Schema namespace {0} already exists for application namespace {1}", [GlideStringUtil.escapeHTML(current.namespace), GlideStringUtil.escapeHTML(current.application_namespace)]));					
		current.setAbortAction(true);
	}
})(current, previous);
