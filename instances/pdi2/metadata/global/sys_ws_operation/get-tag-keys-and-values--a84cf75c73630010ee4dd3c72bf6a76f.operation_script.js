(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var queryParams = request.queryParams;
	
	var grs = new GlideAggregate("cmdb_key_value");
	grs.addNotNullQuery("key");
	grs.addNotNullQuery("value");
	grs.groupBy("key");
	if(queryParams.key){
		grs.addQuery("key", queryParams.key);
		grs.groupBy("value");
	}
	grs.query();
	
	while(grs.hasNext()){
		grs.next();
		result.push({key: grs.getValue("key"), value: grs.getValue("value")});
	}

	response.setStatus(200);
	response.setBody(result);
	
})(request, response);
