(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	
	var grs = new GlideRecordSecure("sys_user_group");
	grs.addEncodedQuery("nameSTARTSWITH" +queryParams.term);
	if(queryParams.encoded_query){
		grs.addEncodedQuery(queryParams.encoded_query);
	}
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		result.push({sys_id: grs.getValue("sys_id"), name: grs.getValue("name")});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
