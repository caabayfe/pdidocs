function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	//hide our field message, it may no longer be relevant
	g_form.hideFieldMsg('action_query', false);
	var tableIsOutOfScope = !isTableInScope(newValue);

	//You can't change the table to an out-of-scope one and also keep the Query flag, and we need to tell you that in the UI before submit
	if (alreadyTrue() && tableIsOutOfScope) {
		g_form.addErrorMessage(getMessage("Business rules that modify queries cannot be created for out-of-scope tables"));
		g_form.setValue('action_query', false);
		g_form.showFieldMsg('action_query', getMessage("Query has been set to false because an out-of-scope table was selected"),"error", false);
	}

	g_form.setDisabled('action_query', tableIsOutOfScope);

	//the in-scope table list is provided by a "display" Business Rule
	function isTableInScope(tableName) {
		var tableList = g_scratchpad.inScopeTableList || [];

		//let's see if the table currently selected is one of our in-scope tables
		for (var i = 0; i < tableList.length; i++) {
			if (tableList[i] == tableName)
				return true;
		}

		//looks like it isn't in-scope
		return false;
	}

	//this is for existing BRs from before the restriction was put in place. They should still be editable
	//though you can't change the table without losing the Query flag
	function alreadyTrue() {
		return (g_form.getValue('action_query') == 'true');
	}
}
