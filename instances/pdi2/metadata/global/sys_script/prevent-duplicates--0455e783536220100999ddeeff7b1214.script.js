(function executeRule(current, previous /*null when async*/ ) {

	var gr = new GlideRecord("trigger_rule_table_cfg");
	gr.addQuery("table", current.getValue("table"));
	gr.addQuery("sys_id", "!=", current.getUniqueValue());
	gr.addActiveQuery();
	gr.query();

	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Trigger Rule Table Config table must be unique"));
	}

})(current, previous);
