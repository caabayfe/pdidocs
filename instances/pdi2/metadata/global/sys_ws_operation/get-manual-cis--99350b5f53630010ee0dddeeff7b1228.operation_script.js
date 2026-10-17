(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var helper = new CSDMAppServiceHelper();
	var term = helper.getParamAsString('term');
	var custom_query = helper.getParamAsString('custom_query');
	var target_table = helper.getParamAsString('target_table');
	var field = helper.getParamAsString('field');
	
	var result = [];
	
	var grs = new GlideRecordSecure(target_table);
	grs.addEncodedQuery(field + "STARTSWITH" + term);
	if(custom_query){
		grs.addEncodedQuery(custom_query);
	}
	grs.query();
	while(grs.next()){
		result.push({sys_id: grs.getValue('sys_id'), name: grs.getValue(field)});
	}

	response.setStatus(200);
	response.setBody(result);

})(request, response);
