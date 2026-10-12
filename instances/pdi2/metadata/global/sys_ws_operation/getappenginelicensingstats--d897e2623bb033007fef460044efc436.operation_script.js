(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var subscriptions = SNC.AppEngineLicensingUsage.getAppEngineLicensesOnInstance();
	
	var records = JSON.parse(subscriptions);
	//gs.info("Total App Engine licenses on insance : " + records.length);	
	
	if (records.length == 0)
		response.setStatus(204);
	else {
		response.setStatus(200);
		response.setBody(records);
	}

})(request, response);
