(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var identification_main_tables = new IdentificationMainTables();
	var className = request.pathParams.className;
	return identification_main_tables.getParentTablesForClassManager(className);
	
})(request, response);
