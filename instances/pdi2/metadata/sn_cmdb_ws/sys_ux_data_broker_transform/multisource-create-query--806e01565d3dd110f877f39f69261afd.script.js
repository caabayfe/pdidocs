function transform(input) {
	var result = {
		error: null,
		status : 'success',
		message : null
	};
	
	var queryJson = input.query_json;
	if(!queryJson) {
		result.status = 'failure';
		result.error = "query_json is missing";
		return result;
	}
	
	var util = new sn_cmdb_ws.MultisourceUtil();
	result = util.createQuery(queryJson);
	
	return result;
	
}
