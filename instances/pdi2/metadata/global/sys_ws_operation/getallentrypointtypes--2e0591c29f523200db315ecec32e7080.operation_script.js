(function process(request, response) {
	var manager = new SNC.EntryPointSelectorManager();
	return manager.getAllEntryPointTypes(request.queryParams.excludeInclusion);
})(request, response);
