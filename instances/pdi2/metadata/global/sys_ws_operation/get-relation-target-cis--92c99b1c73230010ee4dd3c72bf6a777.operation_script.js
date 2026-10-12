(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var queryParams = request.queryParams;
	var serviceId = queryParams.service_id[0];
	var result = [];
	var CI_COUNT_LIMIT = gs.getProperty('glide.cmdb.csdm.app_service.relationship_count_limit', 10000);
	var SERVICE_CLASSIFICATION = "service_classification";
	var SERVICE_OFFERING = "service_offering";
	var BUSINESS_SERVICE = "Business Service";
	var TECHNICAL_SERVICE = "Technical Service";
	var APPLICATION_SERVICE = "Application Service";
	var DYNAMIC_CI_GROUP_CLASS = "cmdb_ci_query_based_service";
	var EMPTY_NAME = gs.getMessage("(empty)");
	var resultObj = {};
	var limitError = gs.getMessage("Available relationships are limited to {0} CIs", CI_COUNT_LIMIT);
	var ciCount = 0;

    var grs = new GlideRecordSecure("cmdb_ci_business_app");
	grs.setLimit(CI_COUNT_LIMIT);
	grs.query();
	
	while(grs.hasNext()){
		ciCount++;
		grs.next();
		var businessAppName = grs.getValue("name") != null ? grs.getValue("name") : EMPTY_NAME;
		result.push({sys_id: grs.getValue("sys_id"), name: businessAppName, class_name: grs.getValue("sys_class_name"), table: "cmdb_ci_business_app"});
	}
	if (CI_COUNT_LIMIT == ciCount) {
		resultObj.limitError = limitError;
	}
	
	ciCount = 0;
	grs = new GlideRecordSecure(SERVICE_OFFERING);
	grs.addEncodedQuery(SERVICE_CLASSIFICATION + "=" + BUSINESS_SERVICE + "^OR" + SERVICE_CLASSIFICATION + "=" + TECHNICAL_SERVICE);
	grs.setLimit(CI_COUNT_LIMIT);
	grs.query();
	
	while(grs.hasNext()){
		ciCount++;
		grs.next();
		var offeringName = grs.getValue("name") != null ? grs.getValue("name") : EMPTY_NAME;
		result.push({sys_id: grs.getValue("sys_id"), name: offeringName, class_name: grs.getValue("sys_class_name"), table: SERVICE_OFFERING, service_classification: grs.getValue(SERVICE_CLASSIFICATION)});
	}
	if (CI_COUNT_LIMIT == ciCount) {
		resultObj.limitError = limitError;
	}

	ciCount = 0;
	grs = new GlideRecordSecure("cmdb_ci_service_auto");
	grs.addEncodedQuery('sys_id' + '!=' + serviceId + '^' + SERVICE_CLASSIFICATION +"=" + APPLICATION_SERVICE + "^" + "sys_class_name!=" + DYNAMIC_CI_GROUP_CLASS);
	grs.setLimit(CI_COUNT_LIMIT);
	grs.query();
	
	while(grs.hasNext()){
		ciCount++;
		grs.next();
		var appServiceName = grs.getValue("name") != null ? grs.getValue("name") : EMPTY_NAME;
		result.push({sys_id: grs.getValue("sys_id"), name: appServiceName, class_name: grs.getValue("sys_class_name"), table: "cmdb_ci_service_auto", service_classification: grs.getValue(SERVICE_CLASSIFICATION)});
	}
	if (CI_COUNT_LIMIT == ciCount) {
		resultObj.limitError = limitError;
	}

	resultObj.result = result;

	response.setStatus(200);
	response.setBody(resultObj);
	
})(request, response);
