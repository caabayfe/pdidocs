(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var manager = new DiscoveryScheduleManager();
	
	var scheduleType = request.queryParams.schedule_type || '';
	var serviceAccountId = request.queryParams.service_account_id || '';
	var locationId = request.queryParams.location_id || '';
	var searchTerm = request.queryParams.search_term || '';
	var sortBy = request.queryParams.sort_by || '';
	var startIndex = request.queryParams.start_index || 0;
    var providerClass = request.queryParams.provider_class || '';
	var activeProviders = request.queryParams.active_providers || false;

	var results = manager.getSchedules(scheduleType, serviceAccountId, locationId, searchTerm, sortBy, startIndex, providerClass, activeProviders);

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);
})(request, response);
