(function executeRule(current, previous /*null when async*/) {
	var field = current.ais_facet_name;
    var app = current.search_context_config;

	var facet = new GlideRecord('sys_search_facet');
	facet.addQuery('sys_id', '!=', current.sys_id);
	facet.addQuery('ais_facet_name', field);
	facet.addQuery('search_context_config', app);
	facet.query();
	if (facet.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("Facet Field '{0}' already exists in '{1}' search application", [field, app.getDisplayValue()]));
		current.setAbortAction(true);
	}
})(current, previous);
