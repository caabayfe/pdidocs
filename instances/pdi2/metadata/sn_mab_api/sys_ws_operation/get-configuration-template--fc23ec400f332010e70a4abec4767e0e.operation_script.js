(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var errorHandler = new ErrorHandler();
	var tableName = request.pathParams.tableName;
	var overrideValue = request.body.data;
	var configResponse;
	
	try {
		configResponse = new TemplateConfigRetrievalService().retrieveConfigTemplate(tableName, overrideValue);
		
		if (!configResponse || configResponse.isEmpty()) {
			errorHandler.throwNotFoundError('Template for ' + tableName + ', not found');
		}
	} catch (error) {
		errorHandler.throwSnWsError(error);
	}
	
	return configResponse;
})(request, response);
