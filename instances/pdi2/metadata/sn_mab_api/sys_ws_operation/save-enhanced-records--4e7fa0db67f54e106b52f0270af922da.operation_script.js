(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var errorHandler = new ErrorHandler();
	var root = request.body.data.root;
	var descendants = request.body.data.descendants;
	var additionalFieldsToUpdate = request.body.data.additionalFieldsToUpdate;
    
	try {
		saveEnhancedRecordsResponse = new EnhancedRecordConfigService(root, descendants, additionalFieldsToUpdate).saveEnhancedRecords();
	} catch (error) {
		errorHandler.throwSnWsError(error);
	}
	
	return saveEnhancedRecordsResponse;
    
    })(request, response);
