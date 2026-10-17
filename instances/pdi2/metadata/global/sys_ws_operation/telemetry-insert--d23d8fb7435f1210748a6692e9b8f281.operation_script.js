(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var requestData = request.body.data;
    if (!requestData || !requestData.resourceMetrics) {
        response.setError(new sn_ws_err.BadRequestError("Invalid or missing 'resourceMetrics' data in the request body"));
        return;
    }

    var jsonString = JSON.stringify(requestData);
    var midServer = request.queryParams.mid_sys_id[0];

    if (!midServer) {
        response.setError(new sn_ws_err.BadRequestError("Missing 'mid_sys_id' query parameter"));
        return;
    }

    var ga = new GlideAggregate('ecc_agent_telemetry');
    ga.addQuery('mid_server', midServer);
    ga.addAggregate('COUNT');
    ga.query();
    ga.next();

    if (ga.getAggregate('COUNT') >= 6) {
        var grOldest = new GlideRecord('ecc_agent_telemetry');
        grOldest.orderBy('sys_created_on');
        grOldest.query();
        if (grOldest.next()) {
            grOldest.deleteRecord();
        }
    }

    var newRecord = new GlideRecordSecure('ecc_agent_telemetry');
    newRecord.initialize();
    newRecord.setValue('mid_server', midServer);
    newRecord.setValue('payload', jsonString);
    var recordSysId = newRecord.insert();

    if (recordSysId) {
        response.setStatus(200);
        response.setBody({
            success: true,
            sys_id: recordSysId
        });
    } else {
        response.setError(new sn_ws_err.ServiceError("Unable to update or insert record: " + gr.getLastErrorMessage(), 500));
    }
})(request, response);
