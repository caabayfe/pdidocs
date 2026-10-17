(function executeRule(current, previous /*null when async*/) {
	
	var ucManager = new PIWBUsecaseManager();
	if(current.status == 'in_progress' || current.status == 'error') {
		ucManager.setUsecaseMonitoringFlag(current.usecase + '', true);
		return;
	}
	
	if(current.status == 'training_complete' && (previous.status == 'in_progress' || previous.status == 'error')) {
		ucManager.setUsecaseMonitoringFlag(current.usecase + '', false);
		return;
	}

})(current, previous);
