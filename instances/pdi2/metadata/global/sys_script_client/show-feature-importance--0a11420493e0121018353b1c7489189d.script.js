function onLoad() {
   if(g_form.getValue("capability") == "workflow_classification_trainer"){
		var solutionProperties = g_form.getValue('solution_properties');
		var jsonSolutionProperties = JSON.parse(solutionProperties);
		var explainability = jsonSolutionProperties.trainingPipeline.pipelineInput.config.explainability;
		//Type appropriate comment here, and begin script below
		if (g_form.getValue('state') == 'solution_complete' && explainability == true) {
			g_form.setSectionDisplay('feature_importance', true);
		} else {
			g_form.setSectionDisplay('feature_importance', false);
		}
	}
	else {
			g_form.setSectionDisplay('feature_importance', false);
	}

}
