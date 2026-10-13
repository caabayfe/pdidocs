(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var alertPanelManager = new sn_nocpit.AlertPanelManager();
	
	var bodyParams;
	var requestBody = request.body;
	var requestData = requestBody.data; //May be an array or a single object
	if (requestData instanceof Array) {
		bodyParams = requestData[0];
	}
	else {
		bodyParams = requestData;
	}
	var serviceIds = bodyParams['serviceIds'];
	var responseString = String(alertPanelManager.getNumOfAlertsForBs(serviceIds));
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);

})(request, response);
