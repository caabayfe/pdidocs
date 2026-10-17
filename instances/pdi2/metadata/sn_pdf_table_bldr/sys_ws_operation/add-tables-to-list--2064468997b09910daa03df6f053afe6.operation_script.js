(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var attachmentSysID = String(request.queryParams.sys_id);
    var tableSysIDs = String(request.queryParams.table_sys_ids);
    var isRetry = String(request.queryParams.is_retry) == 'true';
    var list = tableSysIDs.split(",");
    var return_obj = {};

    var pdfHelper = new PDFtoTableHelper();
    return_obj = pdfHelper.addTablesToList(attachmentSysID, list);

    if (return_obj && return_obj.status === "success") {
        response.setStatus(200);
    } else {
    	if(isRetry){
	pdfHelper.deletePDFDetails(attachmentSysID);
	}
        return_obj.queryParams = {sys_id: attachmentSysID, table_sys_ids: tableSysIDs, is_retry: isRetry};
        response.setStatus(500);
    }
    response.setBody(return_obj);
})(request, response);
