(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var errorHandler = new ErrorHandler();
	var tableName = request.pathParams.tableName;
	var sysId  = request.pathParams.sysId;
	var parentNode = request.queryParams.parentNode;

  try {
		copyPreview = new ConfigRetrievalService(true).retrieveConfig(tableName, sysId, [], parentNode);
		
		if (!copyPreview || copyPreview.isEmpty()) {
			errorHandler.throwNotFoundError('Could not process copy for ' + tableName + ' ' + sysId);
		}
	} catch (error) {
		errorHandler.throwSnWsError(error);
	}
	
	return copyPreview;

})(request, response);
