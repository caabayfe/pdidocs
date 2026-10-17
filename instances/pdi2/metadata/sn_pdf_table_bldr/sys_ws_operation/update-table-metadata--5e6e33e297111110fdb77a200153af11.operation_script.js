(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var payload = request.body.data;
    var res_obj = {
        status: 'success'
    };
    if (!payload) {
		res_obj['status'] = 'error';
        res_obj['message'] = "Payload/tableName is missing in API call.";
    } else {
        res_obj = new PDFtoTableOperationHelper().updateTableMetaData(payload);
    }

    response.setBody(res_obj);

})(request, response);
