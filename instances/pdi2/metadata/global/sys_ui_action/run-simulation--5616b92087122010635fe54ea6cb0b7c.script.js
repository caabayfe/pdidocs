try {
	current.update();
	AutoResolutionSimulationHelper.assessNoSimulationRunning();
	AutoResolutionSimulationHelper.assessRecordCountForSimulationConfig(current.getValue('sys_id'));
	AutoResolutionSimulationHelper.runSimulationForConfig(current.getValue('sys_id'));
} catch(error) {
	gs.addErrorMessage(gs.getMessage('Error running simulation: {0}', error));
}

action.setRedirectURL(current);
