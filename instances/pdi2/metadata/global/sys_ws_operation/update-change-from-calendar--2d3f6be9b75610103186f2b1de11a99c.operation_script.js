(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var table = request.pathParams.table;
    var sysId = request.pathParams.sysid;

    if (!table || !sysId)
        return new sn_ws_err.BadRequestError("Requires table and sys_id");

    var result = {
        "code": 404,
        "data": "Record not found"
    };
    var grs = new GlideRecordSecure(table);
    if (grs.get(sysId)) {
        var params = request.body.nextEntry();
        for (var k in params)
            grs.setValue(k, params[k]);
        if (Object.keys(params).length > 0)
            grs.update();
        if (grs.isActionAborted()) {
            result.code = 403;
            result.data = "Could not update the record. The transaction was aborted.";
        } else {
            result.code = 200;
            result.data = ChangeCommon.toJS(grs, "", true);
        }
    }

    response.setStatus(result.code);
    response.setBody(result);

})(request, response);
