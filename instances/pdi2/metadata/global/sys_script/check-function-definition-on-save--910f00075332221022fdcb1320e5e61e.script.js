(function executeRule(current, previous /*null when async*/) {
    const tableName = current.getValue('name');
    const columnName = current.getValue('element');
    const api = new SNC.DBFunctionAPI();
    const warnings = api.getFunctionWarnings(tableName, columnName);
    if (warnings.length > 0) {
		gs.addWarningMessage(gs.getMessage('Table "{0}" with function field "{1}" has the following syntax warnings:', [tableName, columnName]));
		for (var i = 0; i < warnings.length; i++) {
			gs.addWarningMessage(warnings[i]);
		}
    }
})(current, previous);
