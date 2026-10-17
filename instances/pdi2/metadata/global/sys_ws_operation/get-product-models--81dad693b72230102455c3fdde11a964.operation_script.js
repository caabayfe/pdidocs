(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	var term = queryParams.term[0];
	var grs = new GlideRecordSecure("cmdb_model");
	grs.addEncodedQuery("nameSTARTSWITH" + term);
	grs.query();
	
	while(grs.next()){
		
		result.push({sys_id: grs.getValue("sys_id"), name: grs.getValue("name")});
	}

	response.setStatus(200);
	response.setBody(result);

})(request, response);
