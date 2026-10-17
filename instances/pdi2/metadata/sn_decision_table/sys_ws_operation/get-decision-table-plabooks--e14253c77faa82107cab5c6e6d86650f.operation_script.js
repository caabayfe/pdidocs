(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var queryParams = request.queryParams;
    var decisionTableSysId = queryParams.decision_sys_id;
    if (!decisionTableSysId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage('decision_sys_id query parameter is required.');
    }

    var playbookGenricAPIScript = new PlaybookGenricAPIScript();
    var playbooks = playbookGenricAPIScript.getPlayBookReferncesForDecisionTableBySysId(decisionTableSysId);
    response.setBody(playbooks);
    response.setStatus(200);
})(request, response);
