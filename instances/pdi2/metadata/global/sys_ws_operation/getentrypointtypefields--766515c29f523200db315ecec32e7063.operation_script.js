(function process(request, response) {
	var manager = new SNC.EntryPointSelectorManager();
	return manager.getEntryPointTypeFields(request.queryParams.typeName);
})(request, response);
