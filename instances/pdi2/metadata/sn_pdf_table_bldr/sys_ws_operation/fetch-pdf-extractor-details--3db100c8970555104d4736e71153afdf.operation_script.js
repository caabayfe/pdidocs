(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var tableName = String(request.queryParams.tableName || "");
	var pdfId = String(request.queryParams.pdfId || "");
	
	var helper = new PDFtoTableOperationHelper();
	return helper.getPDFExtractorData(tableName, pdfId);
    
})(request, response);
