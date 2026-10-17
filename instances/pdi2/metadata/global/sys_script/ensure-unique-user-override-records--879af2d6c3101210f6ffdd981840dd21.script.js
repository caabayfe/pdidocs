(function executeRule(current, previous /*null when async*/) {

	// Look for existing records for this user
	var existingRecord = new GlideRecord('sys_ux_user_override');
    existingRecord.addQuery('user', current.getValue('user'));
    existingRecord.setLimit(1);
    existingRecord.query();
    if (existingRecord.next()) {
		    UxUserOverrideShortcutsBRError.logError('A record for this user already exists. Please update the existing record.');
        current.setAbortAction(true); 
    }

})(current, previous);
