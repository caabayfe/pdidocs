try {
	AutoResolutionSimulationHelper.cancelCurrentRunForConfig(current.getValue('sys_id'));
} catch(error) {
	gs.addErrorMessage(gs.getMessage('Error canceling simulation: {0}', error));
}

action.setRedirectURL(current);
