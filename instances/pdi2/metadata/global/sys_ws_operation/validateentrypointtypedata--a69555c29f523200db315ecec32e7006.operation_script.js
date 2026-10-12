(function process(request, response) {
	var manager = new SNC.EntryPointSelectorManager();
	return manager.validateEntryPointTypeData(request.queryParams.entryPointData, request.queryParams.checkUniqueness, request.queryParams.serviceId );
})(request, response);
