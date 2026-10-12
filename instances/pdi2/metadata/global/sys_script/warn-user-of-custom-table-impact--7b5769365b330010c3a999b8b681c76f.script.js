(function executeRule(current, previous /*null when async*/) {
	var tableName = current.getValue('name');

	if (tableName != null && SNC.CustomTableUtils.getUnmappedTableCount("TableName", tableName) == 0) return;

	g_scratchpad.showCustomTableImpactWarning = true;

	if (tableName == null)
		g_scratchpad.customTableImpactWarningMessage = gs.getMessage('warn_user_of_custom_table_impact_new_record');
	else {
		var inventoryURI = SNC.CustomTableUtils.getInventoryURI('TableName', tableName);
		g_scratchpad.customTableImpactWarningMessage = gs.getMessage('warn_user_of_custom_table_impact_existing_record', inventoryURI);
	}
})(current, previous);
