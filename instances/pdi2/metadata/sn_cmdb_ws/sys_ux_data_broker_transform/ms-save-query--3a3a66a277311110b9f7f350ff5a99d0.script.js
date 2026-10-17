function transform(input) {
	
	var result = {
		error: null,
		status : 'success',
		message : null
	};

	var util = new sn_cmdb_ws.MultisourceUtil();
	var query_json = input.queryInfo.query_json;
	var query_sys_id = input.queryInfo.query_sys_id;
	
	if(!query_json) {
		result.status = 'failure';
		result.error = "query_json is missing";
		return result;
	}
	
	if(query_sys_id) {
		result = util.updateQuery(query_sys_id,query_json);
	} else {
		result = util.createQuery(query_json);
	}
	
	return result;
}
