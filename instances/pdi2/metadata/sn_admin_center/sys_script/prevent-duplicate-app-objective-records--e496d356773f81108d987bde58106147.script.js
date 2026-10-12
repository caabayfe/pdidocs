(function executeRule(current, previous /*null when async*/) {

	if (current.operation() === 'insert')
		abortOnDuplicateAppAndObjective();
	else // must be update
		handleUpdate();
	
	function abortOnDuplicateAppAndObjective() {
		if (thereExistsADuplicate())
			abortActionWithError();
	}
	
	function thereExistsADuplicate() {
		var duplicateAppObjectiveRecords = submitDuplicateAppObjectiveRecordsQuery();
		var numDuplicates = duplicateAppObjectiveRecords.getRowCount();
		
		return numDuplicates !== 0;
	}
	
	function submitDuplicateAppObjectiveRecordsQuery() {
		var duplicateAppObjectiveRecords = new GlideRecord('sn_admin_center_solution');
		duplicateAppObjectiveRecords.addQuery('application', current.application)
									.addCondition('objective', current.objective)
									.addCondition('sys_id', '!=', current.sys_id);
		duplicateAppObjectiveRecords.query();
		
		return duplicateAppObjectiveRecords;
	}
	
	function abortActionWithError() {
		current.setAbortAction(true);
		var errorMsg = gs.getMessage('There already exists a solution with the same business objective and application');
		gs.addErrorMessage(errorMsg);
	}
	
	function handleUpdate() {
		
		// just so we can avoid querying when possible
		if (updateDuplicationIsImpossible())
			return;
		
		abortOnDuplicateAppAndObjective();
		
	}
	
	function updateDuplicationIsImpossible() {
		var applicationWasUnchanged = current.application.toString() === previous.application.toString();
		var businessObjectiveWasUnchanged = current.objective.toString() === previous.objective.toString();
		
		return applicationWasUnchanged && businessObjectiveWasUnchanged;
	}

})(current, previous);
