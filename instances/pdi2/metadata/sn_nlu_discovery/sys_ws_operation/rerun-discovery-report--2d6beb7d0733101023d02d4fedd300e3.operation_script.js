(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reportDefId = request.pathParams.report_def_id;
    
	var reportDefRec = new GlideRecord('sn_nlu_discovery_report_definition');
    reportDefRec.get(reportDefId);

    if (!reportDefRec.isValidRecord()) {
        var errorMsg = 'Cannot load report definition with ID ' + reportDefId;
        gs.warn('[DISC] rerun_report: ' + errorMsg);
        return {
            error: errorMsg
        };
    }
    
    var intentDiscUtil = new sn_nlu_discovery.IntentDiscoveryUtil();
    var resp = intentDiscUtil.rerun(reportDefRec);

    if ((resp || {}).error) {
        return {
            error: resp.error
        };
    }
    return {
        message: 'Re running report ' + reportDefRec.getValue("name"),
    };
})(request, response);
