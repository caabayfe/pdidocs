redirectToSlushBucket();

function redirectToSlushBucket() {
	var uri = action.getGlideURI();
	var path = uri.getFileFromPath();
	uri.set('sysparm_m2m_ref', current.getTableName());
	uri.set('sysparm_stack', 'no');
	uri.set('sysparm_query', 'resource_type!=^EQ');
	uri.set('sysparm_list_entries', getExistingSearchResources());
	action.setRedirectURL(uri.toString('cxs_m2m_template.do'));
}

function getExistingSearchResources() {
	var searchConfigList = '';
	var gr = new GlideRecord('cxs_res_context_config');
	gr.addQuery('cxs_context_config', parent.sys_id);
	gr.addQuery('cxs_search_res_config.resource_type', '!=', '');
	gr.addActiveQuery();
	gr.query();
	while (gr.next()) {
		searchConfigList += gr.cxs_search_res_config.sys_id + ',';
	}
	return searchConfigList;
}
