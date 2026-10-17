resetAccessPolicyDefaults();

function resetAccessPolicyDefaults() {
	var tables = ["help_answer","help_content","help_guidance","help_guidance_step","help_guidance_task","help_m2m_step_dependency","help_question","help_setup_dependency","help_user_interaction","help_user_interaction_log","help_user_interaction_step"];
		
	var fields = [
		{ name: "read_access", defaultValue: "true" },
		{ name: "create_access", defaultValue: "true" },
		{ name: "update_access", defaultValue: "true" },
		{ name: "delete_access", defaultValue: "true" },
		{ name: "ws_access", defaultValue: "true" },
		{ name: "alter_access", defaultValue: "true" },
		{ name: "actions_access", defaultValue: "true" },
		{ name: "client_scripts_access", defaultValue: "true" },
		{ name: "configuration_access", defaultValue: "true" }
	];
	
	updateDictionary(fields);
	
	// Reset all default values in the dictionary for the *_access fields on help and guidance tables
	function updateDictionary(fields) {
		// Reset default value in the dictionary
		var tableRec = new GlideRecord('sys_db_object');
		tableRec.addQuery('name', 'IN', tables.join(",")); 
		tableRec.query();
		while (tableRec.next()) {
			for (var fieldIndex in fields) {
				var field = fields[fieldIndex];
				if (field && field.name) {	
					if(!(tableRec.name == "help_guidance_task" && field.name == "delete_access"))
						tableRec[field.name] = field.defaultValue;
				}
			}
			tableRec.update();
		}
	}
}
