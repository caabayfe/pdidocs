(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var reportId = request.pathParams.report_id;

    try {
        var body = request.body.dataString;

        var responseString = JSON.parse(SNC.ReportAlias.saveAliases(reportId, body));

        response.setContentType('application/json');
        response.setStatus(200);
        response.setBody(
            responseString
        );

        return response;
    } catch (e) {
        //convert the exception to response.
        var ex = e + '';
        var errorResponse = new sn_ws_err.ServiceError();
        errorResponse.setMessage(ex);

        if (ex.indexOf('IllegalArgumentException') > 0)
            errorResponse.setStatus(400);
        else if (ex.indexOf('ACLException') > 0)
            errorResponse.setStatus(403);
        else
            errorResponse.setStatus(500);

        return errorResponse;
    }

})(request, response);
