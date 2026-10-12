(function executeRule(current, previous /*null when async*/) {

	if (!gs.nil(current.table)) {
		var tableRecord = new GlideRecord('sys_db_object');
		tableRecord.query('name', current.table);
		if (tableRecord.next()) {
			current.setValue('table_name', tableRecord.getUniqueValue());
		}
	}

})(current, previous);
