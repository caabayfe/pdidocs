function onLoad() {
	limitDataPolicyRuleOnOutOfScopeTable();
}
   
function limitDataPolicyRuleOnOutOfScopeTable() {
	var tableName = g_form.getValue("table");
	var outOfScope = !isTableInScope(tableName);
	g_form.setReadOnly("mandatory", outOfScope);
}

function isTableInScope(tableName) {
	if (tableName == "")
		return true;

	var allowedTables = g_scratchpad.inScopeTableList;
	for (var i = 0;  i < allowedTables.length;  i++) {
		if (allowedTables[i] == tableName)
			return true;
	}
	return false;
}
