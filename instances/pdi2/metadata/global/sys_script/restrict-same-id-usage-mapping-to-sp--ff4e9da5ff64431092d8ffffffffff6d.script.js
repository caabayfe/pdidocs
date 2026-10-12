(function executeRule(current, previous /*null when async*/) {

	var existingRecord = new GlideRecord(current.getTableName());
	existingRecord.addQuery('service_profile', current.service_profile);
	existingRecord.addQuery('usage', current.usage);
	// For updates, exclude the current record from the check
	if (current.operation() == 'update') {
		existingRecord.addQuery('sys_id', '!=', current.sys_id);
	}
	existingRecord.addActiveQuery();
	existingRecord.query();
	if (existingRecord.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. This Service Profile already has a question mapped to this Usage. Please choose a different Usage or Service Profile.'));
	}

})(current, previous);
