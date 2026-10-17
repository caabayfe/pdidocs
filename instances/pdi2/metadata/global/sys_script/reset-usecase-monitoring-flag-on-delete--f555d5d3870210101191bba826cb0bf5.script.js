(function executeRule(current, previous /*null when async*/) {
	
	var ucManager = new PIWBUsecaseManager();
	// reset monitoring flag on delete
	ucManager.setUsecaseMonitoringFlag(current.usecase+'', false);

})(current, previous);
