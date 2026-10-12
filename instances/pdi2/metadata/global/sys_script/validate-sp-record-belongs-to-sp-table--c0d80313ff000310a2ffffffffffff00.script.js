(function executeRule(current, previous /*null when async*/) {

	var serviceProfileGr = new GlideRecord(current.service_profile_table);
	serviceProfileGr.addQuery('sys_id', current.service_profile);
	serviceProfileGr.query();
	if (!serviceProfileGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save record: Service Profile should belong to the Service Profile table.'));
	}

})(current, previous);
