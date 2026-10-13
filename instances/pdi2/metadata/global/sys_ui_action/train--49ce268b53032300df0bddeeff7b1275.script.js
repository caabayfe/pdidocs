try {
	// Ensure a MetricBase connection can be established
	sn_clotho.ClothoConfigService.testConnectivity();
	
	// Redirect to current
	action.setRedirectURL(current);

	// Delete current model instances
	deleteInstances();
	
	// Mark training in progress
	current.training_outcome = 'Training in progress';
	
	// Update model
	current.update();
	
	// Queue training
	gs.eventQueue("metricbase.train", current);
} catch(e) {
	// Mark training with empty string
	current.training_outcome = "";
	
	// Update model
	current.update();
	
	// Abort action
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("MetricBase Connection Failure"));
}


function deleteInstances() {
	var modelInstance = new GlideRecord("mb_model_instance");
	modelInstance.addQuery("mb_model", current.sys_id);
	modelInstance.query();
	while (modelInstance.next())
		modelInstance.deleteMultiple();
}
