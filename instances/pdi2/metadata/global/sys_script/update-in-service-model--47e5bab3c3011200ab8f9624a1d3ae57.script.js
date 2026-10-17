(function executeRule(current, previous /*null when async*/) {
	
	//This function will be automatically called when this rule is processed.
	gs.log("*** About to sync BS operation " + current.operation() + " with Service Modeling ***");
	var manager = new SNC.ServiceModelingIntegrationManager();
	if (!current.layer) {
		gs.log("*** Business service " + current.sys_id + " is not in the Service Model and about to be inserted ***");
		var utils = new ServiceMappingUtils();
		utils.resetModel(current);
	}
	else {
		gs.log("*** About to update BS " + current.sys_id + " in Service Model ***");
		manager.modifyBusinessService(current);
	}

})(current, previous);
