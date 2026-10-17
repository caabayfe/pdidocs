(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sanitize = new ServiceMappingSanitizeIdAPI();
	var serviceId = sanitize.sanitizeIdString(request.pathParams.service_id);
    var bsGlideRecord = new GlideRecord("cmdb_ci_service_discovered");
	bsGlideRecord.addQuery("sys_id", serviceId);
	bsGlideRecord.query();
	bsGlideRecord.next();
	bsGlideRecord.deleteRecord();

})(request, response);
