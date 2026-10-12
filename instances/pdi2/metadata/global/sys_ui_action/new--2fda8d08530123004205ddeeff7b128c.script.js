function newFuncFromRelatedList() {
	var params = [];
	params.push('sysparm_view=' + g_list.view);
	params.push('sysparm_referring_url=' + g_list.getReferringURL());
	
	if (g_form && g_form.getTableName) {
		var parentTable = isScreenExtension(g_form.getTableName(), 'sys_sg_screen') ? 'sys_sg_screen' : g_form.getTableName();
		params.push('sysparm_query=parent_table=' + parentTable + '^parent=' + g_form.getUniqueValue());
	}
	
	openStudioTab(g_list.tableName + '.do?sys_id=-1&' + params.join('&'), g_list.title);
	return false;

	function isScreenExtension(table, base) {
		var ga = new GlideAjax('TableExtensionsProcessor');
		ga.addParam('sysparm_name', 'doesTableExtend');
		ga.addParam('sysparm_table_name', table);
		ga.addParam('sysparm_base_table_name', base);
		ga.getXMLWait();
		return ga.getAnswer() === 'true';
	}
}
