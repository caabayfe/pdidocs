current.isInManageLifecycle = true;
current.oldStartDate = previous.starts.getDisplayValue(); 
current.oldEndDate = previous.ends.getDisplayValue(); 
manageContractLifecycleWrapper();
current.isInManageLifecycle = false;

function manageContractLifecycleWrapper() { 
	// First, if dates have changed, or record has been approved, run Configuration checks
	if (current.starts.changes() || current.ends.changes() || current.renewal_date.changes() ||
		(current.substate.indexOf('approv') >= 0)) {
		var o = new ConditionChecks();
		o.checkRecord(current);
	}
	
	// If there is a renewal_active, or extension-active to be processed from running the Configuration checks, process it
	if (current.substate.indexOf('_active') >= 0) {
		
		if (current.substate.equals('renewal_active')) {
			(new ContractManagementUtils()).renewContract(current);
			current.substate = ''; 
			current.update();
		}
		else if (current.substate.equals('extension_active')) {
			(new ContractManagementUtils()).extendContract(current);
			current.substate = '';
			current.update();
		}
	
		// then, run the configuration checker against the updated substate and dates
		var recheck = new ConditionChecks();
		recheck.checkRecord(current);
	}
}
