(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	
	var alertPanelManager = new sn_nocpit.AlertPanelManager();
	var bodyParams;
	var requestBody = request.body;
	var requestData = requestBody.data; 
 
	var queryParams = request.queryParams;
	var alertHistoryId = requestData['alertHistoryId'];
 
 
    var responseString=String(alertPanelManager.getAllCisOfAlertByMode(alertHistoryId));

	
    response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);
 
})(request, response);
