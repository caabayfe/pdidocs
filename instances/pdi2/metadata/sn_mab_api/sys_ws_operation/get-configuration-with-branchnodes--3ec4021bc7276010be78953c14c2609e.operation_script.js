(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var tableName = request.pathParams.tableName;
	var sysId = request.pathParams.sysId;
	var externalNodes = request.body.data.externalNodes;
	var configResponse;
	
	try {
		var configRetrievalService = new ConfigRetrievalService(false);
		configResponse = configRetrievalService.retrieveConfig(tableName, sysId, externalNodes);
	} catch (error) {
		new ErrorHandler().throwSnWsError(error);
	}

	if (!configResponse || configResponse.isEmpty()) {
		return new sn_ws_err.NotFoundError('Configuration for ' + tableName + ', with ID: ' + sysId + ', not found');
	}
	
	return configResponse;
})(request, response);
