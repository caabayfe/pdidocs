(function executeRule(current, previous /*null when async*/) {

	var existingRecord = new GlideRecord(current.getTableName());
	existingRecord.addQuery('service_profile', current.service_profile);
	existingRecord.addQuery('question', current.question);
	// For updates, exclude the current record from the check
	if (current.operation() == 'update') {
		existingRecord.addQuery('sys_id', '!=', current.sys_id);
	}
	existingRecord.addActiveQuery();
	existingRecord.query();
	if (existingRecord.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. Question is already mapped to this Service Profile. Please choose a different question or Service Profile.'));
	}

})(current, previous);
