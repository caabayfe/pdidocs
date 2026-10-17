(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var query = request.queryParams;
	var timestamp = query.hasOwnProperty('timestamp') ? query.timestamp : '';
	var includeBusinessServices = query.hasOwnProperty('includeBusinessServices') ? query.includeBusinessServices : false; 
	
	var sgtManager = new sn_nocpit.ServiceGroupsTreeManager();
	var responseString = String(sgtManager.getGroupTree(includeBusinessServices, timestamp));
	response.setStatus(200);
	response.setContentType('application/json');

	var writer = response.getStreamWriter();
	writer.writeString(responseString);

})(request, response);
