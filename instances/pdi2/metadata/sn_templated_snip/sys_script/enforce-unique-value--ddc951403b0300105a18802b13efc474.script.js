(function executeRule(current, previous /*null when async*/) {
	var grExistingChannel = new GlideRecord(current.getRecordClassName());
	grExistingChannel.addQuery('value', current.getValue('value'));
	grExistingChannel.addQuery('sys_id', '!=', current.getUniqueValue());
	grExistingChannel.setLimit(1);
	grExistingChannel.query();
	
	if (grExistingChannel.hasNext()) {
		gs.addErrorMessage(gs.getMessage("A {0} with a value of {1} already exists.", [current.getClassDisplayValue(), current.value]));
		current.setAbortAction(true);
		gs.setRedirect(current);
	}

})(current, previous);
