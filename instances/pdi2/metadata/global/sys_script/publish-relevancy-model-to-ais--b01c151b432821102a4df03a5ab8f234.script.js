(function executeRule(current, previous /*null when async*/) {

	gs.info('Publishing model artifact Id: ' + current.sys_id + ' to AIS');
	var pushRelevancyService = new sn_ais.PushRelevancyService();
	try {
		pushRelevancyService.pushRelevancyModelToAisWithArtifact(current.getUniqueValue());
	} catch (ex) {
		var errorMsg = gs.getMessage('Failed to publish the model to AIS!');
		gs.addErrorMessage(errorMsg);
		gs.addErrorMessage(ex.getMessage());
	}
	
})(current, previous);
