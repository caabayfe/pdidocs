(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var manager = new DiscoveryResultManager();
	var locationId = request.queryParams.location_id || '';
	var searchTerm = request.queryParams.search_term || '';
	var sortBy = request.queryParams.sort_by || '';
	var filteredSchedules = (request.body.data.filtered_schedules && JSON.parse(request.body.data.filtered_schedules)) || '';
	var results = manager.getScheduleResults(locationId, searchTerm, sortBy, filteredSchedules);
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(results);
})(request, response);
