(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cs_adapter_card');
	gr.addQuery('name', current.name);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Card Name must be unique'));
		current.setAbortAction(true);
	}
})(current, previous);
