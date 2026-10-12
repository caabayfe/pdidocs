function transform(input) {
	var result = {
		error: null,
		status : 'success',
		message : null
	};
	
	var querySysId = input.query_sys_id;
	if (!querySysId) {
		result.status = 'failure';
		result.error = "query_sys_id is missing";
		return result;
	}
	
	var queryJson = input.query_json;
	if(!queryJson) {
		result.status = 'failure';
		result.error = "query_json is missing";
		return result;
	}
	
	var util = new sn_cmdb_ws.MultisourceUtil();
	result = util.updateQuery(querySysId,queryJson);
	
	return result;
	
}
