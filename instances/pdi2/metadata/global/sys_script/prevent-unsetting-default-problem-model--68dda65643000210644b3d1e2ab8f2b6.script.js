(function executeRule(current, previous /*null when async*/) {
	var prbModelGr = new GlideRecord("prb_model");
	prbModelGr.addQuery("sys_id", "!=", current.sys_id);
	prbModelGr.addQuery("default_prb_model", "1");
	prbModelGr.addQuery("table_name", current.getValue("table_name"));
	prbModelGr.query();
	if (!prbModelGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("There must be a default Problem model"));
	}
})(current, previous);
