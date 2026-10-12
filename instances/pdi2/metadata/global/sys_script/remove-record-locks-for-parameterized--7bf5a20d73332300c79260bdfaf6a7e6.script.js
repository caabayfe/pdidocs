(function executeRule(current, previous /*null when async*/) {

	// don't do anything if the action is being aborted
	if (current.isActionAborted())
		return;

	// remove this test's records modified when 'Enabled Parameterized Testing' value changes
	var m2mGR = new GlideRecord('sys_atf_modified_record_m2m');
	m2mGR.addQuery('test', current.getUniqueValue());
	m2mGR.query();
	while (m2mGR.next()) {
		var modifiedRecordId = m2mGR.record.toString();
		m2mGR.deleteRecord();
		// now check if anyone else is using that modified record, if not we can delete the sys_atf_modified_record
		var m2mGR2 = new GlideRecord('sys_atf_modified_record_m2m');
		m2mGR2.addQuery('record', modifiedRecordId);
		m2mGR2.query();
		if (!m2mGR2.next()) {
			var mrGR = new GlideRecord('sys_atf_modified_record');
			if (mrGR.get(modifiedRecordId))
				mrGR.deleteRecord();
		}
	}

})(current, previous);
