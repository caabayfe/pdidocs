(function process(request, response) {		
	var tableNames, result;
	
	try {
		tableNames = JSON.parse(request.queryParams.table_names);
	} catch (e) {
		throw new sn_ws_err.BadRequestError("Invalid or missing param 'table_names'");
	}
	
	result = _.mapObject(FileTypeInfo.get(tableNames), function(type, name) {
		return type.canRead ? type : _.pick(type, 'canRead');
	});
	
	response.setBody(result);
	response.setStatus(200);
	response.setContentType('application/json');
})(request, response);
