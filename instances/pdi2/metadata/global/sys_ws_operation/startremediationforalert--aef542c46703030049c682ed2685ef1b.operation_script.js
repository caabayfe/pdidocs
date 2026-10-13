(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var fIsScopedARMActive = EvtMgmtAlertMgmtProperties.isARMScopedAppActive(); // Whether ARM scoped app is active or not

    var fEvtMgmtAlertMgmtGetActionsFromRulesDynamic;
    if (!fIsScopedARMActive) {
        gs.include('EvtMgmtAlertMgmtGetActionsFromRules');
        fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new EvtMgmtAlertMgmtGetActionsFromRules();
    } else {
        gs.include('sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped');
        fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped();
    }

    var alertSysId = request.queryParams.alertId[0];
    var workflowSysId = request.queryParams.workflowId[0];
    var ciSysId = request.queryParams.ciId[0];
    var taskId;
    if (request.queryParams.alertManagementRule && request.queryParams.alertManagementRule[0] == 'true') {
        var workflowDisplayName = request.queryParams.workflowDisplayName[0];
        var rule = request.queryParams.ruleId[0];
        var actionId = request.queryParams.actionId[0];
        var isSubFlow = false;
        if ((request.queryParams.isSubflow) && ((request.queryParams.isSubflow[0] == 'true'))) {
            isSubFlow = true;
        }
        taskId = fEvtMgmtAlertMgmtGetActionsFromRulesDynamic.startAction(alertSysId, ciSysId, workflowSysId, workflowDisplayName, rule, isSubFlow, actionId);
    } else {
        taskId = SNC.RemediationScriptableApi.startRemediation(String(alertSysId), String(ciSysId), String(workflowSysId));
    }
    return {
        "taskId": taskId
    };
})(request, response);
