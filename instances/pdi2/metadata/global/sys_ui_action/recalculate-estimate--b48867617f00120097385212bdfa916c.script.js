function startEstimation() {
    var gwt = new GwtMessage();
    g_form.addInfoMessage(gwt.getMessage("Estimation of records selected by the condition is in progress. Record estimate field will be updated once the process is complete."));
    var destroyRuleId = g_form.getUniqueValue();
    var destroyDuration = g_form.getValue('archive_duration');
    var glideAjax = new GlideAjax("EstimateCalculatorAjax");
    glideAjax.addParam("sysparm_name", "calculate");
    glideAjax.addParam("sysparm_destroy_rule_id", destroyRuleId);
    glideAjax.addParam("sysparm_archive_duration", destroyDuration);
    glideAjax.getXML(estimationResponse);
}

function estimationResponse(response) {
    var result = response.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var recordEstimate = result[0].getAttribute("record_estimate");
        var estimateDate = result[0].getAttribute("estimate_date");
        g_form.setValue('record_estimate', recordEstimate);
        g_form.setValue('estimate_date', estimateDate);
        var gwt = new GwtMessage();
        g_form.addInfoMessage(gwt.getMessage("Record estimate field updated with value based on the latest estimate."));
    }
}
