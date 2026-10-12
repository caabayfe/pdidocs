(function refineQuery(current, parent) {
	var gr = new GlideRecord('sys_update_xml');
	gr.addQuery("type", "App Install");
	gr.addQuery("update_set", parent.sys_id);
	gr.query();

	if (!gr.next())
		current.addNullQuery('sys_id');
	else {
		var query = current.addQuery("sys_update_name", gr.name);
		while(gr.next())
			query.addOrCondition("sys_update_name", gr.name);
	}

})(current, parent);
