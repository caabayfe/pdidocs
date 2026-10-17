(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("service_table_config");
	gr.addEncodedQuery("sys_id!="+current.getUniqueValue()+"^ORsys_idISEMPTY");
	gr.addQuery("service_table", current.service_table);
	gr.query("active", current.active);
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Same service table cannot be mapped to multiple configurations!"));
		current.setAbortAction(true);
	}
})(current, previous);
