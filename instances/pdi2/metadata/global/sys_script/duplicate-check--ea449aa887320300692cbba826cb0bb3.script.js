(function executeRule(current, previous /*null when async*/) {

	var grUac = new GlideRecord('cxs_ui_action_config');
	grUac.addQuery('search_ui_action', current.search_ui_action);
	grUac.addQuery('search_resource', current.search_resource);
	grUac.addQuery('search_ui_config', current.search_ui_config);
	grUac.addQuery('search_res_config', current.search_res_config);
	grUac.query();
	if (grUac.next() && grUac.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage("Duplicate Record: The Search Resource, Configuration and Action combination already exists"));
		current.setAbortAction(true);
	}
})(current, previous);
