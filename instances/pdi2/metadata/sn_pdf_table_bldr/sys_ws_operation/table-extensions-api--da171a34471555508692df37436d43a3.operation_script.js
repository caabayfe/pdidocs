(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var tableName = String(request.queryParams.tableName);
    var return_obj = new PDFtoTableHelper().getTableExtensions(tableName);
	response.setBody(return_obj);
})(request, response);
