(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var attachmentSysID = String(request.queryParams.sys_id);
    var return_obj = new PDFtoTableHelper().deletePDFDetails(attachmentSysID);

    response.setBody(return_obj);
})(request, response);
