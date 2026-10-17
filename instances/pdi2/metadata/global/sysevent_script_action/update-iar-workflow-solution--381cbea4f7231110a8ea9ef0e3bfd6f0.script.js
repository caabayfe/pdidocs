updateWfSolution();

function updateWfSolution() {

	var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	configGr.addQuery(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME, AutoResolutionConstants.INCIDENT_TABLE_NAME);
	configGr.query();

	if (configGr.next()) {
		/* Query Workflow solution, WF will not be active in Utah, so to support Tokyo/Utah -> V upgrade we 
		 shouldn't do the active check */
		var workflowConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
		workflowConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configGr.getUniqueValue());
		workflowConfigGr.addQuery('capability', AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW);
		workflowConfigGr.query();

		// Query Composite solution
		var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
		languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configGr.getUniqueValue());
		languageConfigGr.addQuery('capability', AutoResolutionConstants.ML_CAPBILITIES.COMPOSITE);
		languageConfigGr.query();
		var compositeLanguageExists = languageConfigGr.next();
	

		// Workflow solution already exists, and no Compoite solution so update (Tokyo/Utah -> V upgrade)
		// loop through all languages of workflow solution
		while (workflowConfigGr.next() && !compositeLanguageExists){
			gs.info("Executing IAR Script Action: Update IAR workflow solution");
			var workflowSolutionName = workflowConfigGr.getValue('ml_solution_name');

			// Get properties from solution
			try {
				var workflowSolution = sn_ml.AgentZeroSolutionStore.get(workflowSolutionName);
				var properties = workflowSolution.getProperties();
				var propertiesJson = JSON.parse(properties);
			}
			catch (ex) {
				gs.print('Exception caught: ' + ex.getMessage());
			}

			//Update Workflow solution
			try {
				var newSolution = new sn_ml.AgentZeroSolution({
					'label': propertiesJson['label'],
					'domainName': propertiesJson['domainName'],
					'processingLanguage': propertiesJson['processingLanguage'],
					'schedulingInfo': {
						'mluc': propertiesJson['schedulingInfo']['mluc']
					}
				});

				sn_ml.AgentZeroSolutionStore.update(workflowSolutionName, newSolution);

				//Train the updated solution
				var script = "var configLangGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME); " +
					"configLangGr.get(\"" + workflowConfigGr.getUniqueValue() + "\"); " +
					"var mlHelper = new AutoResolutionMLHelper(\"" + configGr.getUniqueValue() + "\"); " +
					"var result = mlHelper.trainSolution(\"" + workflowSolutionName + "\", configLangGr); " +
					"if (result.status === 'error') " +
					"gs.warn(\"Executing IAR fix script: error occurred during training workflow solution {0}\", result.msg); " +
					"else {" +
					"mlHelper.toggleScheduleJobActive(true); " +
					"gs.info(\"Executing IAR fix script: Successfully re-trained workflow solution and made the legacy auto-resolution solution inactive.\"); }";

				var solutionSysTrigger = new GlideRecord("sys_trigger");
				solutionSysTrigger.initialize();
				solutionSysTrigger.setValue("name", 'Re-train IAR wf solution');
				solutionSysTrigger.setValue("script", script);
				solutionSysTrigger.setValue("trigger_type", 0);
				solutionSysTrigger.insert();
			}
			catch (ex) {
				gs.print('Exception caught: ' + ex.getMessage());
			}
		}
	}
}
