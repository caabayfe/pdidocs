function startEstimation() {
    var gwt = new GwtMessage();
    if (g_scratchpad.shouldDisplayConditions && g_form.getValue('destroy_rule.condition')) {
        g_form.addInfoMessage(gwt.getMessage("Destroy estimate is unavailable when conditions are used to destroy."));
        return;
    }
    g_form.addInfoMessage(gwt.getMessage("Estimation of destroy records selected by the condition is in progress. Record estimate field will be updated once the process is complete."));
    var archiveRuleId = g_form.getUniqueValue();
    var destroyDuration = g_form.getValue('destroy_rule.archive_duration');
    var glideAjax = new GlideAjax("EstimateCalculatorAjax");
    glideAjax.addParam("sysparm_name", "calculate");
    glideAjax.addParam("sysparm_archive_rule_id", archiveRuleId);
    glideAjax.addParam("sysparm_archive_duration", destroyDuration);
    glideAjax.getXML(estimationResponse);
}

function estimationResponse(response) {
    var result = response.responseXML.getElementsByTagName("result");
    if (result && result.length > 0) {
        var recordEstimate = result[0].getAttribute("record_estimate");
        var estimateDate = result[0].getAttribute("estimate_date");
        g_form.setValue('destroy_rule.record_estimate', recordEstimate);
        g_form.setValue('destroy_rule.estimate_date', estimateDate);
        var gwt = new GwtMessage();
        g_form.addInfoMessage(gwt.getMessage("Destroy record estimate field updated with value based on the latest estimate."));
        g_tabs2Sections.setActive(0);
    }
}
