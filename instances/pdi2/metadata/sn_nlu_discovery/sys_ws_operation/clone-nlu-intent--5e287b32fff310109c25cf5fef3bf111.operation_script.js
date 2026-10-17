(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var reportId = request.pathParams.report_id;
    var intentName = ((request.queryParams || {}).intent_name || [])[0];
    var modelId = ((request.queryParams || {}).model_id || [])[0];
    var modelProps = ((request.queryParams || {}).model_props || [])[0] || '{ "lang": "en"}';
    var secLanguages = ((request.queryParams || {}).secondary_languages || [])[0];

    gs.debug('[DISC] clone_intent: Called with ' +
        ' reportId=' + reportId +
        ' intentName=' + intentName +
        ' modelId=' + modelId +
        ' modelProps=' + modelProps +
        ' secLanguages=' + secLanguages
    );

    if (!reportId) {
        return {
            error: gs.getMessage('report_id is missing')
        };
    }

    if (!intentName) {
        return {
            error: gs.getMessage('intent_name is missing')
        };
    }

    if (!modelId) {
        return {
            error: gs.getMessage('model_id is missing')
        };
    }

    try {
        modelProps = JSON.parse(modelProps);
    } catch (e) {
        return {
            error: gs.getMessage('Invalid modelProps format (should be Object JSON)')
        };
    }

    var intentUtil = new sn_nlu_discovery.IntentDiscoveryUtil();
    var report = new GlideRecord('sn_nlu_discovery_report');
    report.get(reportId);
    if (!report.isValidRecord()) {
        return {
            error: gs.getMessage('No report found')
        };
    }

    var reportDef = new GlideRecord('sn_nlu_discovery_report_definition');
    reportDef.get(report.getValue('definition'));
    if (!reportDef.isValidRecord()) {
        return {
            error: gs.getMessage('No report definition found')
        };
    }
    var taxoModel = reportDef.getValue('model');

    if (secLanguages)
        secLanguages = secLanguages.split(',');

    // API cloneIntent: function(reportId, taxModel, taxIntentName, modelId, modelProps)

    var result = intentUtil.cloneIntent(reportId, taxoModel, intentName, modelId, modelProps, secLanguages);
    gs.debug('[DISC] Cloned intent into modelId ' + modelId);

    return result;
})(request, response);
