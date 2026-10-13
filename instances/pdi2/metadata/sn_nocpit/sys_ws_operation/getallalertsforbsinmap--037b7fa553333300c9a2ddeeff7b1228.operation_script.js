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
	var serviceId = bodyParams['ciIds'];
	var nsPath = bodyParams['pathIds']||'';
	var timestamp = bodyParams['timestamp'];
 	var firstRow = bodyParams['firstRow'];
	var sortByField = bodyParams['sortByField'];
	var isOrderASC = bodyParams['isOrderASC'];
   
    var responseString=String(alertPanelManager.getAllAlertsForBsInMap(serviceId,  nsPath, timestamp, firstRow, sortByField, isOrderASC));

    
    response.setStatus(200);
    response.setContentType('application/json');
    var writer = response.getStreamWriter();
    writer.writeString(responseString);
     
})(request, response);
