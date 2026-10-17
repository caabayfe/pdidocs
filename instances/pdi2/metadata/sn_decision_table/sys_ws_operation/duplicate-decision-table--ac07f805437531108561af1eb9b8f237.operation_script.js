(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var queryParams = request.queryParams;
    var data = request.body.data;
    var decisionTableId = queryParams.decisionTableId;
    var decisionTableName = data.decisionTableName;
    var application = data.application;
    var includeDelta = data.includeDelta;
    var duplicateDecisions = data.duplicateDecisions;

    var gr = new GlideRecordSecure("sys_decision");
    gr.get(decisionTableId);
    if (!gr.canRead()) {
        throw new sn_ws_err.ServiceError()
            .setStatus(403)
            .setMessage("User don't have the required access");
    }


    if (!decisionTableId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('decisionTableId query parameter is required.');
    }

    var decisionBuilderAPI = new sn_dt.DecisionTableBuilderAPI();

    var copyDTResponse = decisionBuilderAPI.copyDecisionTable(decisionTableId, decisionTableName, duplicateDecisions, application, includeDelta);
    var decisionTableRecord = copyDTResponse.record;
    var results = {};
    if (decisionTableRecord) {
        results.decisionTableDetails = {
            sysId: decisionTableRecord.getValue("sys_id"),
            name: decisionTableRecord.getValue("name"),
        };
    }

    if (copyDTResponse.status === "Failure") {
        if (decisionTableRecord) {
            response.setBody(results);
            response.setStatus(500);
        } else {
            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage('Some internal error occurred');
        }
    } else {
        response.setBody(results);
        response.setStatus(200);
    }



})(request, response);
