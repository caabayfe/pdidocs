(function executeRule(current, previous /*null when async*/) {

	new SNC.OrchestratorAction().jobConfigurationChanged(current, current.getValue('name')); 

})(current, previous);
