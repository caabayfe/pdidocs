(function executeRule(current, previous /*null when async*/ ) {

    var assignedEntityConfig = new sn_gf.GFGoalAssignedEntityConfig(current.getValue('assigned_entity_table'), current.getValue('assigned_entity_field')).isValidConfig();
	if(!assignedEntityConfig["isValid"]) {
		current.setAbortAction(true);
		gs.addErrorMessage(assignedEntityConfig["errorMsg"]);
	}

})(current, previous);
