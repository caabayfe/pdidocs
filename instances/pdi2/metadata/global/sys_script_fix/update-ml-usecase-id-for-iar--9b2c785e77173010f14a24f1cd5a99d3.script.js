executeFix();

function executeFix() {
	var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	configGr.addQuery('target_table_name', AutoResolutionConstants.INCIDENT_TABLE_NAME);
	configGr.query();
	
	if (configGr.next()) {
		var mlSolutionName = configGr.getValue('ml_solution_name');
		// check if the solution is from Quebec and update it
		if (!gs.nil(mlSolutionName)) 
			updateMLCapabilityDefinition(mlSolutionName);
		else {
			var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
			languageConfigGr.addQuery('configuration', configGr.getUniqueValue());
			languageConfigGr.query();
			while (languageConfigGr.next()) {
				mlSolutionName = languageConfigGr.getValue('ml_solution_name');
				// update for the solutions on language configurations
				if (!gs.nil(mlSolutionName))
					updateMLCapabilityDefinition(mlSolutionName);
			}
		}
	}	
}

function updateMLCapabilityDefinition(solutionName) {
	var gr = new GlideRecord('ml_capability_definition_base');
	gr.addQuery('solution_name', solutionName);
	gr.query();
	
	if (gr.next()) {
		var newProps = {};
		newProps = JSON.parse(gr.getValue('solution_properties'));
		newProps.advancedParams = {"mluc":AutoResolutionConstants.INCIDENT_USE_CASE_ID};
		gr.setValue('solution_properties', JSON.stringify(newProps));
		gr.update();
		gs.info('IAR Fix Script execution: Finished updating ML Usecase Id for Incident Auto-Resolution configuration with solution name: {0}', solutionName);
	}
}
