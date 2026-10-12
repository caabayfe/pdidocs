(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tableName = String(request.queryParams.tableName);

    var grTable = new GlideRecord("sys_db_object");
    grTable.addQuery("name", tableName);
	grTable.query();
	if(grTable.next()){
		var helper = new PDFtoTableOperationHelper();
		return helper.getPDFTablesInfo(grTable.getValue("sys_id"));
	}
	else return [];
   

})(request, response);
