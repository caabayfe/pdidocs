function redirectToNewRecord() {
	var url = new GlideURL('cmdb_group_contains_qb_query.do');
	url.addParam('sys_id', -1);
	url.addParam('sysparm_query', 'group=' + g_form.getUniqueValue());

	this.location = url.getURL();
}
