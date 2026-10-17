(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var attachmentSysId = request.queryParams ? request.queryParams.attachmentSysId : null;
    var isConnectionTimeOut = request.queryParams ? String(request.queryParams.connectionTimeOut) : null;
    var return_obj = {};

    if (!attachmentSysId) {
        response.setStatus(500);
        response.setBody({
            status: 'error',
            message: 'Attachment sys_id is missing from payload'
        });
    }

    return_obj = new PDFtoTableHelper().getPollStatus(attachmentSysId, (isConnectionTimeOut === "true"));

    if (return_obj && return_obj.status !== 'error') {
        response.setStatus(200);
    } else {
        response.setStatus(500);
        return_obj = {
            status: 'error',
            message: 'Something went wrong while polling'
        };
    }

    response.setBody(return_obj);

})(request, response);
