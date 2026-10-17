(function executeRule(current, previous /*null when async*/) {

	// create new entry with the host name if it doesn't exist	
	var gr = new GlideRecord("cmdb_ci_metric_extension");
	gr.addQuery("mid_sys_id", current.mid_server.sys_id);
	gr.query();

	if (!gr.next())
	{
		gr.mid_sys_id = current.mid_server.sys_id;
		gr.extension_id = current.mid_server.sys_id;
		gr.name = current.name;
		gr.insert();
	}
	else
	{
		gr.name = current.name;
		gr.update();
	}	
})(current, previous);
