(function executeRule(current, previous /*null when async*/) {
	var prbTaskModelGr = new GlideRecord("prb_task_model");
	prbTaskModelGr.addQuery("sys_id", "!=", current.sys_id);
	prbTaskModelGr.addQuery("default_prb_task_model", "1");
	prbTaskModelGr.addQuery("table_name", current.getValue("table_name"));
	prbTaskModelGr.query();
	while (prbTaskModelGr.next()) {
		prbTaskModelGr.setValue("default_prb_task_model", "0");
		prbTaskModelGr.update();
	}
})(current, previous);
