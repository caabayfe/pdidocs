(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var attachment_helper_sys_id = String(request.queryParams.sys_id);
	var isRetryParsing = String(request.queryParams.retryParsing);
    var return_obj = {};
    var preProcessPdf = new PDFtoTableHelper();

    try {
        var result = preProcessPdf.processPdf(attachment_helper_sys_id, (isRetryParsing === "true"));
        response.setStatus(200);
        return_obj.status = "success";
        return_obj.message = "successfully submitted PDF for parsing.";
        response.setBody(return_obj);
    } catch (e) {
        response.setStatus(500);
        return_obj.status = "error";
        return_obj.message = e.message || (response && response['message']);
        response.setBody(return_obj);
    }

})(request, response);
