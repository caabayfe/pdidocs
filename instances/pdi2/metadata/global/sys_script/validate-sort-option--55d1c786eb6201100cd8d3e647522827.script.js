(function executeRule(current, previous /*null when async*/) {
    var app = current.search_context_config;

	var sort = new GlideRecord('sys_search_sort_option');
	sort.addQuery('sys_id', '!=', current.sys_id);
	sort.addQuery('search_context_config', app);
	sort.addQuery('ais_field_name', current.ais_field_name);
	sort.addQuery('ascending', current.ascending);
	sort.query();
	if (sort.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("Sort Option with the same Field and Sort order already exists in '{0}' search application", app.getDisplayValue()));
        current.setAbortAction(true);
	} else {
		var sortL = new GlideRecord('sys_search_sort_option');
		sortL.addQuery('sys_id', '!=', current.sys_id);
		sortL.addQuery('search_context_config', app);
		sortL.addQuery('gui_label', current.gui_label);
		sortL.query();
		if (sortL.getRowCount() > 0) {
			gs.addErrorMessage(gs.getMessage("Sort Option with the same Label already exists in '{0}' search application", app.getDisplayValue()));
			current.setAbortAction(true);
		}
	}
})(current, previous);
