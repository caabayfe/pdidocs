(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	
	var grs = new GlideRecordSecure("svc_by_tags_candidates");
	grs.addQuery("service_family", queryParams.service_family);
	if(queryParams.current_service){
		grs.addEncodedQuery("actual_serviceISEMPTY^ORactual_service=" + queryParams.current_service);
	} else {
		grs.addNullQuery("actual_service");
	}
	if(queryParams.encoded_query){
		grs.addEncodedQuery(queryParams.encoded_query);
	}
	
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		result.push({sys_id: grs.getValue("sys_id"), name: grs.getValue("service_name")});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
