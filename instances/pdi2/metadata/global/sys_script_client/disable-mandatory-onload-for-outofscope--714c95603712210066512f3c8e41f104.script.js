function onLoad() {
	limitUIPolicyActionsOnLoadOnOutOfScopeTables();
}

function limitUIPolicyActionsOnLoadOnOutOfScopeTables() {
	var tableName = g_form.getValue("table");
	if(!isTableInScope(tableName)) {
		g_form.setReadOnly("mandatory",true);
	} else {
		g_form.setReadOnly("mandatory",false);
	}
}

function isTableInScope(tableName) {
	if(tableName === "")
		return true;
	var allowedTables = g_scratchpad.inScopeTableList;
	for(var i = 0;i<allowedTables.length;i++) {
		if(allowedTables[i] == tableName) {
			return true;
		}
	}
	return false;
}
