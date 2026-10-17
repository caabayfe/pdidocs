(function executeRule(current, previous /*null when async*/) {
	
	var actionAssignment = "declarative_action_assignment";
	var playbookExperience = "playbook_experience";
	var activityDefinition = "activity_definition";
	var domain = "sys_domain";
	var displayOrder = "display_order";

	var uniqueConstraintFields = [actionAssignment, playbookExperience, activityDefinition, domain];
	var displayOrderUpdateRequest = false;

	// Check if the display order is being updated
	if (!gs.nil(previous) && current.getValue(displayOrder) != previous.getValue(displayOrder)) {
		displayOrderUpdateRequest = true;
		for (var i = 0; i < uniqueConstraintFields.length; i++) {
			if (current.getValue(uniqueConstraintFields[i]) != previous.getValue(uniqueConstraintFields[i])) {
				displayOrderUpdateRequest = false;
				break;
			}
		}
	}
	
	var existingPlaybookActionAssignmentMap = new GlideRecord("sys_playbook_experience_action_assignment_map");
	
	existingPlaybookActionAssignmentMap.addQuery(actionAssignment, current.getValue(actionAssignment));
	existingPlaybookActionAssignmentMap.addQuery(playbookExperience, current.getValue(playbookExperience));
	existingPlaybookActionAssignmentMap.addQuery(activityDefinition, current.getValue(activityDefinition));
	existingPlaybookActionAssignmentMap.addQuery(domain, current.getValue(domain));
	existingPlaybookActionAssignmentMap.setLimit(1);
	existingPlaybookActionAssignmentMap.query();
	
	if(existingPlaybookActionAssignmentMap.getRowCount() > 0 && !displayOrderUpdateRequest){
		var errorMessage = gs.getMessage("A record with this Playbook Experience, Activity Definition and Action already exists");
		gs.addErrorMessage(errorMessage);
		current.setAbortAction(true);
	}

})(current, previous);
