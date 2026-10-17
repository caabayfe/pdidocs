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

	var returnObject={};
	var queryParams = request.queryParams;
	var serviceId = bodyParams['serviceId'];
	var ciIds = bodyParams['ciIds'];
	var pathIds = bodyParams['pathIds'];
	var timestamp = bodyParams['timestamp'];
	var infraPathCis = bodyParams['infraPathCis'];	
	var firstRow = bodyParams['firstRow'];
	var sortByField = bodyParams['sortByField'];
	var isOrderASC = bodyParams['isOrderASC'];
	 
  
	var responseString=String(alertPanelManager.getAllAlertsForCis(serviceId,ciIds,pathIds,timestamp,infraPathCis,firstRow,sortByField,isOrderASC));

	
    response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);
	 
})(request, response);
