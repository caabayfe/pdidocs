(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var errorHandler = new ErrorHandler();
	var tableName = request.pathParams.tableName;
	var sysId = request.pathParams.sysId;
	var configResponse;
	
	try {

		configResponse = new ConfigRetrievalService(false).retrieveConfig(tableName, sysId);

		if (!configResponse || configResponse.isEmpty()) {
			errorHandler.throwNotFoundError('Configuration for ' + tableName + ', with ID: ' + sysId + ', not found');
		}
		
	} catch (error) {
		errorHandler.throwSnWsError(error);
	}
	
	return configResponse;
})(request, response);
