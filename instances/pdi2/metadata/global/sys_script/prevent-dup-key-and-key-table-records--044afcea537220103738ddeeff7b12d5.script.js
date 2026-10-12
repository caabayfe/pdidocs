(function executeRule(current, previous /*null when async*/) {
	var existingCustomProvider = new GlideRecord("sys_sg_custom_map_provider");
	existingCustomProvider.addQuery("key", current.key);
	existingCustomProvider.addQuery("key_table", current.key_table);
	existingCustomProvider.setLimit(1);
	existingCustomProvider.query();
	
	if(!existingCustomProvider.next()
		|| previous == null 
		|| existingCustomProvider.getUniqueValue() === current.getUniqueValue())
		return;

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("A custom map provider already exists for the specified key and key table."));
})(current, previous);
