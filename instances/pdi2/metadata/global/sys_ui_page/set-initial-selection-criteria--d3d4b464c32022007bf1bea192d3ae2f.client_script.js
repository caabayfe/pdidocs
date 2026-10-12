function actionOK() {
	var msAjax;
	var i;
	var agents = gel("agents").value.split(",");
	var capabilities = $('capabilities').checked;
	var applications = $('applications').checked;
	var ipRanges = $('ip_ranges').checked;
	for (i = 0; i < agents.length; i++) {
		msAjax = new GlideAjax("MIDServerAjax");
		msAjax.addParam("sysparm_name","setSelectionCriteria");
		msAjax.addParam("sysparm_agent", agents[i]);
		msAjax.addParam("sysparm_capabilities", capabilities);
		msAjax.addParam("sysparm_applications", applications);
		msAjax.addParam("sysparm_ip_ranges", ipRanges);
		msAjax.getXMLAnswer(null);
	}

	GlideDialogWindow.get().destroy();
}

function actionCancel() {
 GlideDialogWindow.get().destroy();
 return false;
}
