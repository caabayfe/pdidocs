function onLoad() {
   //No table has been selected because this is a brand-new record
   if (g_form.isNewRecord())
	   return;
	
	var selectedTable = g_form.getValue('collection');
	var shouldDisable = !isTableInScope(selectedTable) && !alreadyTrue();
	
	g_form.setDisabled('action_query', shouldDisable);

	//a Display rule gives us the list of tables in our scope
	function isTableInScope(tableName) {
		var tableList = g_scratchpad.inScopeTableList || [];
		
		for (var i = 0; i < tableList.length; i++) {
			//see if the selected table is one of the tables we know to be in our scope
			if (tableList[i] == tableName)
				return true;
		}
		
		return false;
	}
	
	//this should only be true if the BR existed before this restriction was in place
	function alreadyTrue() {
		return g_form.getValue('action_query') == 'true';
	}
}
