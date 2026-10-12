(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	
	var grs = new GlideRecordSecure("svc_by_tags_service_families");
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		result.push({sys_id: grs.getValue("sys_id"), name: grs.getValue("name")});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
