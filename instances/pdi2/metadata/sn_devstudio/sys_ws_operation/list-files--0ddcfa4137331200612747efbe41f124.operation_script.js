(function process(request, response) {
	var files;
	
	try {
		files = JSON.parse(request.queryParams.sys_ids);
	} catch (e) {
		throw new sn_ws_err.BadRequestError("Invalid or missing param 'sys_ids'");
	}	
	
	var result = _.reduce(files, function(memo, sysIds, tableName) {
		var gr = new GlideRecord(tableName);		
		
		gr.addQuery('sys_id', 'IN', sysIds);
		gr.query();	
		
		while (gr.next()) {
			memo[gr.getUniqueValue()] = gr.canRead() ? gr.getDisplayValue() : 403;
		}
		
		return memo;
	}, {});
	
	response.setBody(result);
	response.setStatus(200);
	response.setContentType('application/json');

})(request, response);
