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
	
	var util = new sn_cmdb_ws.MultisourceUtil();
	result = util.deleteQuery(querySysId);
	
	return result;
	
}
