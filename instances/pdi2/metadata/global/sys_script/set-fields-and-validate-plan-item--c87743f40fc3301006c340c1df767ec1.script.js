(function executeRule(current, previous /*null when async*/) {

	try {
		var upgradePlanAPI = new sn_utc.UpgradePlanAPI();
		
		if (!current.scope)
			current.scope = upgradePlanAPI.getScope(current);

		var resultObj = JSON.parse(upgradePlanAPI.getUpgradePlanItemValidation(current));
		if (resultObj.isValid)
			return;

		// whenever there is an update/insert to sys_upgrade_plan_item table, we have to run all the validations
		// if the plan item is not active, we just show the error message and allow the update
		// but if the plan item is being made active or is already active, any failed validation should fail the update
		// consider the scenario when the customer deleted the entry in sys_metadata_customization for an app
		// and then they want to mark the item as active=false, we should allow the operation to go through
		// even though the validation would fail with INVALID_CUSTOMIZATION_VERSION cause its just deactivation
		if (current.active) {
			gs.addErrorMessage(resultObj.message);
			current.setAbortAction(true);
		} else {
			gs.addWarningMessage(resultObj.message);
		}	
	} catch (e) {
		current.setAbortAction(true);
	}

})(current, previous);
