(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	function validate(filters) {
		if (!filters.name) {
			return false;
		}
		if (!filters.fromDate) {
			return false;
		}
		if (!filters.toDate) {
			return false;
		}
		return true;
	}
	
	var filters = request.body.data;
	var valid = validate(filters);
	if (!valid) {
		response.setStatus(400);
		response.setError("Invalid request, missing required fields.");
		return;
	}
	
	var applicationGr = new GlideRecord('sn_ci_analytics_application');
	if (!applicationGr.isValid()) {
		response.setStatus(500);
		response.setError("No analytics application found");
		return;
	}
	applicationGr.addQuery('application_name', 'Virtual Agent');
	applicationGr.query();
	var applicationId;
	if (applicationGr.next()) {
		applicationId = applicationGr.getValue('sys_id');
	}
	
	if (!applicationId) {
		response.setStatus(500);
		response.setError("No analytics application found for Virtual Agent");
		return;
	}

    var API = new sn_analytics_api.AnalyticsEventsApi('sn_ci_analytics_application', applicationId);
	var result = API.getAnalyticsEventPropertyValuesByDate({
		date_bucket: 'day',
		event_type_filter: 'Topic',
		event_name_filter: filters.name,
		event_property_name_filter: 'Last Node Visited',
		from_date: filters.fromDate,
		to_date: filters.toDate,
		platform: 'chat'
	});
	
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(JSON.parse(result));

})(request, response);
