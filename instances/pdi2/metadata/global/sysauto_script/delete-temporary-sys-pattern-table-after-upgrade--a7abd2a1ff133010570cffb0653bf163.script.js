(function() {
	var tableUtil = new TableUtils("z_tmp_sys_pattern");
	if (tableUtil.tableExists()) {
		var gr = new GlideRecord('sys_db_object');
		gr.addQuery('name', 'z_tmp_sys_pattern');
		gr.query();
		if (!gr.next())
			tableUtil.drop("z_tmp_sys_pattern");
	}
})();
