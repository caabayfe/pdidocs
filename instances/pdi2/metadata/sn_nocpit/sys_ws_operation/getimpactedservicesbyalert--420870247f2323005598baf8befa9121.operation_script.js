(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var alertPanelManager = new sn_nocpit.AlertPanelManager();
	var queryParams = request.queryParams;
	var alertId = queryParams.alertId;
	var groupId = queryParams.groupId;
	var ciId = queryParams.ciId;
	var responseString = String(alertPanelManager.getImpactedServicesByAlert(alertId, groupId, ciId));
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);

})(request, response);
