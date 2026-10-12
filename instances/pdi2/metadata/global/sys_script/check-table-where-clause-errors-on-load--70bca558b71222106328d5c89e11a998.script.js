// Alert the user when loading a view table if the where clause has errors and/or warnings.
(function executeRule(current, previous /*null when async*/) {
	const viewTableSysID = current.getUniqueValue();
	var api = new ViewWhereClauseAPI();
	const warnings = api.getGenericDbWarnings(viewTableSysID);
	if (warnings.length > 0) {
		const tableName = current.getValue('table');
		const prefix = current.getValue('variable_prefix');
		gs.addWarningMessage(gs.getMessage('View table "{0}" with prefix "{1}" has a where_clause value with the following syntax warnings:', [tableName, prefix]));
		for (var i = 0; i < warnings.length; i++) {
			gs.addWarningMessage(warnings[i]);
		}
	}
})(current, previous);
