(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	
	var grs = new GlideRecordSecure("cmdb_model");
	grs.addEncodedQuery("nameSTARTSWITH" + queryParams.term + "^ORdisplay_nameSTARTSWITH" + queryParams.term);
	if(queryParams.encoded_query){
		grs.addEncodedQuery(queryParams.encoded_query);
	}
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		var name = !grs.display_name.nil() ? grs.getValue("display_name") : grs.getValue("name");
		result.push({sys_id: grs.getValue("sys_id"), name: name});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
