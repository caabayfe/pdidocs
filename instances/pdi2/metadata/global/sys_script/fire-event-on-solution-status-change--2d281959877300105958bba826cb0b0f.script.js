(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	if (current.status == 'error') {
		gs.eventQueue('piwb.model.training.failure', current);			
	} else if (current.status == 'training_complete') {
		gs.eventQueue('piwb.model.training.successful', current);
	}
})(current, previous);
