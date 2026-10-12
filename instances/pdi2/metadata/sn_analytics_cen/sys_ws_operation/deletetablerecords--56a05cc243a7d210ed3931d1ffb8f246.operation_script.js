(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /*
    Request: Body - sysId, table
    Response: Returns with 200 if the delete is successful 
    */

    const requestBody = request.body.data; // Extract the request body
    var sysIds = requestBody.sysId || [];
    var tableName = requestBody.table || '';

    if (sysIds.length == 0) {
        response.setError(new sn_ws_err.NotFoundError('SysIds is an empty array'));
        response.setStatus(404);
        return;
    }

    if (!tableName) {
        response.setError(new sn_ws_err.NotFoundError('Table name is missing'));
        response.setStatus(404);
        return;
    }

    var result = new global.AnalyticsCenterUtil().deleteDashboards(tableName, sysIds);
    if (result.status === 'failed') {
        response.setError(new sn_ws_err.NotFoundError('No matching records found.'));
        response.setStatus(404);
        response.setBody(result);
        return;
    }

    response.setStatus(200);

})(request, response);
