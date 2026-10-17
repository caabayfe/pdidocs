(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var tableName = request.pathParams.table_name;
    var fieldNames = request.queryParams.fieldNames;

    try {
        var result = {};
        var fieldDescriptions = SNC.TableAndFieldDescription.getFieldDescriptions(tableName, fieldNames);

        response.setStatus(200);
        response.setBody(fieldDescriptions);
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
