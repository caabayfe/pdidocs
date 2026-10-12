function showIndexName() {
	var table = g_form.getValue('table');
	var indexGr = new GlideRecord('ts_index_name');
	indexGr.addQuery('table', table);
	indexGr.query();
	if (indexGr.next())
		window.open('ts_index_name.do?sys_id=' + indexGr.sys_id);
	else
		g_form.addInfoMessage(new GwtMessage().getMessage('No index name record found for table {0}', table));
}
