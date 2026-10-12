(function executeRule(current, previous /*null when async*/) {
	
	if (shouldAbort())
		abortIt();
	
	function shouldAbort() {
		//you can do what you want with tables in your scope
		if (gs.isTableInScope(current.getValue('collection')))
			return false;
		
		//you can't add a before-query rule to out-of-scope tables
		if (current.isNewRecord()) {
			return true;
		} else {
			//you can't make an existing rule before-query on an out-of-scope table, and we only get here when query is true (1)
			if (current.getValue('action_query') != previous.getValue('action_query'))
				return true;
			
			//you can't change the table for an existing out-of-scope-table business rule, either
			if (current.collection.changes() || current.getValue('collection') != previous.getValue('collection'))
				return true;
			
		}
		
		//it's fine. existing before-query rule, not changing the table.
		return false;
	}
	
	//Let the user know we rejected their record
	function abortIt() {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Business rules that modify queries cannot be created for out-of-scope tables"));
	}
})(current, previous);
