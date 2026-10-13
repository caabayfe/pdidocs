(function executeRule(current, previous /*null when async*/) {
	// delete old entry	
	var grDel = new GlideRecord("cmdb_ci_metric_extension");
	grDel.addQuery("mid_sys_id", current.mid_server.sys_id);
	grDel.query();

	if (grDel.next())
	{
		grDel.deleteRecord();
	}

})(current, previous);
