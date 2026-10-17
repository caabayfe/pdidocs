(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {
		'value': gs.getProperty('show_probe_to_patterns_migration_banner', 'false')
	};
    response.setBody(result);
    response.setStatus(200);
    response.setContentType('application/json');
})(request, response);
