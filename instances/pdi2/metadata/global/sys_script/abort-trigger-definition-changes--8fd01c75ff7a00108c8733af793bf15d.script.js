(function executeRule(current, previous /*null when async*/) {
	//Abort change is in use by a trigger instance
	var record = new GlideRecord("sys_pd_trigger_instance");
	record.addQuery("trigger_definition", current.getUniqueValue());
	record.query();
	
	if (record.hasNext() && (current.trigger_inputs.table.changes() || current.trigger_type.changes())) {
		gs.addErrorMessage(gs.getMessage("Trigger definition cannot be modified if in use by a trigger instance"));
		current.setAbortAction(true);
	}
})(current, previous);
