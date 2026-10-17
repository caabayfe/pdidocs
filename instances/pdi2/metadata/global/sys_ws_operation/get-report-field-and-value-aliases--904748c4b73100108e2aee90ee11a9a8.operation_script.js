(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reportId = request.pathParams.report_id;

    try {
        var fieldAliases = SNC.ReportAlias.getAllAliases(reportId);
        var result = JSON.parse(fieldAliases);

        response.setBody(result);

        response.setContentType('application/json');
        response.setStatus(200);
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
