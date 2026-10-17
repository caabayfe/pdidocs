assignGlobalPlaybookExperienceDAs();

function assignGlobalPlaybookExperienceDAs() {
	var globalExperienceDAs = {};
	var grActionAssignmentMap = new GlideRecord('sys_playbook_experience_action_assignment_map');
	var grDAAssignment = new GlideRecord('sys_declarative_action_assignment');
	
	grActionAssignmentMap.query();
	
	// Load existent assignment map entries
	while (grActionAssignmentMap.next()) {
		globalExperienceDAs[grActionAssignmentMap.getValue('declarative_action_assignment')] = 1;
	}
	
	grDAAssignment.query('model', 'ca57d12e730333004a905ee515f6a7b2');
	
	// Go through all available Playbook Card declarative actions
	while (grDAAssignment.next()) {
		var assignmentRecordSysId = grDAAssignment.getUniqueValue();
		var assignmentScope = grDAAssignment.getValue('sys_scope');
		
		// Add missing DA assignment map record with non-empty names
		if (!globalExperienceDAs.hasOwnProperty(assignmentRecordSysId) && grDAAssignment.getValue('action_name')) {
			grActionAssignmentMap.setValue('declarative_action_assignment', assignmentRecordSysId);
			grActionAssignmentMap.setValue('playbook_experience', '98e09a560f2200102920c912d4767e1a'); // Global Playbook Experience sysId
			grActionAssignmentMap.setValue('sys_scope', assignmentScope);
			
			grActionAssignmentMap.insert();
		}
	}
}
