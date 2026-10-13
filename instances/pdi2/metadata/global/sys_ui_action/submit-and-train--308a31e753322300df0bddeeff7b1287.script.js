try {	
	// Ensure a MetricBase connection can be established
	sn_clotho.ClothoConfigService.testConnectivity();
	
	// Redirect to current
	action.setRedirectURL(current);

	// Mark training in progress
	current.training_outcome = 'Training in progress';

	// Update model
	current.update();
	
	// Queue training
	gs.eventQueue("metricbase.train", current);	
	
} catch(e) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("MetricBase Connection Failure"));
}
