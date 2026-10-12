(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	// implement resource here
	var identificationLookUp = new IdentificationLookUpTables();
	var className = request.pathParams.className;
	
	return identificationLookUp.getLookupTablesForClassManager(className);
	
})(request, response);
