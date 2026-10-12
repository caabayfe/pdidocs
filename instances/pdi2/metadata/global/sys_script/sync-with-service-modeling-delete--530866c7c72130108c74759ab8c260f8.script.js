function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	gs.log("*** About to sync BS operation delete with Service Modeling ***");
	var manager = new SNC.ServiceModelingIntegrationManager();
	if (!current.layer.nil()) {
		gs.log("*** About to delete BS " + current.sys_id + " from Service Model ***");
		manager.removeBusinessService(current);		
	}
}
