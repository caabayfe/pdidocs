function newFromRelatedList() {
	var params = [];
	params.push('sysparm_view=' + g_list.view);
	params.push('sysparm_referring_url=' + g_list.getReferringURL());
	
	if (g_form) {
		params.push('sysparm_query=parent_table=' + g_form.getTableName() + '^parent=' + g_form.getUniqueValue());
	}
	
	openStudioTab(g_list.tableName + '.do?sys_id=-1&' + params.join('&'), g_list.title);
	return false;
}
