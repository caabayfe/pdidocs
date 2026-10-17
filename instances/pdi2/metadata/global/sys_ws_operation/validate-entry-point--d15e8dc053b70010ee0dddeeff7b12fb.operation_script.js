(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var manager = new SNC.EntryPointSelectorManager();
	return manager.validateEntryPointTypeData(request.queryParams.entryPointData, request.queryParams.checkUniqueness, request.queryParams.serviceId );

})(request, response);
