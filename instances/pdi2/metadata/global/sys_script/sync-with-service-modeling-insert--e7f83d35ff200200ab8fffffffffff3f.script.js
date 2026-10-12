function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	gs.log("*** About to sync BS operation insert with Service Modeling ***");
	var manager = new SNC.ServiceModelingIntegrationManager();
	if (current.layer.nil()) {
		gs.log("*** About to insert BS " + current.sys_id + " to Service Model ***");
		manager.createBusinessService(current);
	}
}
