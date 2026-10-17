if (new IPKICertMapManager().getActiveRecordByAgent(current.getValue('sys_id')) !== null) {
	gs.addInfoMessage(gs.getMessage("Initiating certificate rotation."));
	action.setRedirectURL(current);
	new MidIPKIUtility().forceRotate(current.getValue('sys_id'));
} else {
	gs.addErrorMessage(gs.getMessage("This MID Server is not enabled to use a ServiceNow certificate."));
	action.setRedirectURL(current);
}
