(function executeRule(current, previous /*null when async*/) {

	var tableName = current.table_name + '';
	var userColumn = current.user_column + '';

	if (JSUtil.nil(tableName) || JSUtil.nil(userColumn))
		return;

	if (userColumn == 'sys_id') {
		if (!doesTableExtendSysUser(tableName)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Cannot save the record. When user column is sys_id, the table must extend sys_user.'));
		}
		return;
	}

	var dictionaryGr = new GlideRecord('sys_dictionary');
	dictionaryGr.addQuery('name', tableName);
	dictionaryGr.addQuery('element', userColumn);
	dictionaryGr.addQuery('internal_type', 'reference');
	dictionaryGr.query();

	if (dictionaryGr.next()) {
		var reference = dictionaryGr.reference + '';
		if ('sys_user'.equalsIgnoreCase(reference))
			return;
	}

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Cannot save the record. User column must be a reference to sys_user.'));

	function doesTableExtendSysUser(tblName) {
		if (!tblName) return false;
		var visited = {};
		return checkInheritance(tblName, visited);
	}

	function checkInheritance(tblName, visited) {
		if (visited[tblName]) return false;
		visited[tblName] = true;
		if (tblName == 'sys_user') return true;

		var tableGr = new GlideRecord('sys_db_object');
		tableGr.addQuery('name', tblName);
		tableGr.query();
		if (tableGr.next()) {
			var superClass = tableGr.getValue('super_class');
			if (superClass) return checkInheritance(superClass, visited);
		}
		return false;
	}

})(current, previous);
