createIncidentTask();
function createIncidentTask() {
	current.update();
	var url = new sn_sow_inc.SOWIncidentUtils().getNewIncidentTaskLink(current);
	action.setRedirectURL(url);
	action.setReturnURL(current);
}
