// Alert the user when saving a view if any of the view tables have a where clause errors and/or warnings.
(function executeRule(current, previous /*null when async*/) {
	const viewSysID = current.getUniqueValue();
	const viewTables = new GlideRecord('sys_db_view_table');
	viewTables.addQuery('view', viewSysID);
	viewTables.query();
	const api = new ViewWhereClauseAPI();
	while (viewTables.next()) {
		const viewTableSysID = viewTables.getValue('sys_id');
		const warnings = api.getGenericDbWarnings(viewTableSysID);
		if (warnings.length > 0) {
			const viewName = current.getValue('name');
			const tableName = viewTables.getValue('table');
			const prefix = viewTables.getValue('variable_prefix');
			gs.addWarningMessage(gs.getMessage('View table "{0}" with prefix "{1}" has a where_clause value with the following syntax warnings:', [tableName, prefix]));
			for (var i = 0; i < warnings.length; i++) {
				gs.addWarningMessage(warnings[i]);
			}
		}
	}
})(current, previous);
