(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var payload = request.body.data;
    var tableName = request.pathParams['table_name'];
    var queryParams = request.queryParams;
    var pdf_id = "",
        newTableName = "";

    if (queryParams.hasOwnProperty("pdfId")) {
        pdf_id = String(queryParams['pdfId']);
    }

    if (queryParams.hasOwnProperty("new_table_name")) {
        newTableName = String(queryParams['new_table_name']);
    }

    var res_obj = {
        status: 'success'
    };
    if (!payload || !tableName) {
		res_obj['status'] = 'error';
        res_obj['message'] = "Payload/tableName is missing in API call.";
    } else {
        res_obj = new PDFtoTableOperationHelper().updateTableData(tableName,pdf_id,payload,newTableName);
    }

    response.setBody(res_obj);

})(request, response);
