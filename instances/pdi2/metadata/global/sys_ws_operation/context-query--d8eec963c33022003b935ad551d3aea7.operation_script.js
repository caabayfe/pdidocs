(function process(request, response) {
	return new RowFieldQueryTerm().processQueryTerm(
		request.queryParams.sysparm_table.toString(), 
		request.queryParams.sysparm_field.toString(), 
		request.queryParams.sysparm_operator.toString(), 
		request.queryParams.sysparm_sys_id.toString()
	);
})(request, response);
