(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var alertSysId = request.queryParams.alertId[0];
    var retrieveLaunchApplications = false;
    var retrieveRemediations = false;
    var retrieveSubflows = false;
    var result;
    //if no parameters are sent is getting all types by default
    if (!request.queryParams.retrieveLaunchApplications && !request.queryParams.retrieveRemediations && !request.queryParams.retrieveSubflows) {
        retrieveLaunchApplications = true;
        retrieveRemediations = true;
        retrieveSubflows = true;
    } else {
        //if one of the parameters is not undefined it will be false by default 
        if (request.queryParams.retrieveLaunchApplications) {
            retrieveLaunchApplications = (request.queryParams.retrieveLaunchApplications[0] == 'true');
        }
        if (request.queryParams.retrieveRemediations) {
            retrieveRemediations = (request.queryParams.retrieveRemediations[0] == 'true');
        }
        if (request.queryParams.retrieveSubflows) {
            retrieveSubflows = (request.queryParams.retrieveSubflows[0] == 'true');
        }
    }
    var retrieveParams = {
        retrieveLaunchApplications: retrieveLaunchApplications,
        retrieveRemediations: retrieveRemediations,
        retrieveSubflows: retrieveSubflows
    };
    if (gs.getProperty('evt_mgmt.alert.management.activated', false) === 'true') { //getting also the legacy remediations when true
        var fEvtMgmtAlertMgmtGetActionsFromRulesDynamic;
        if (!EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            gs.include('EvtMgmtAlertMgmtGetActionsFromRules');
            fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new EvtMgmtAlertMgmtGetActionsFromRules();
        } else {
            gs.include('sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped');
            fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped();
        }
        result = fEvtMgmtAlertMgmtGetActionsFromRulesDynamic.getRemediationsAndLaunches(alertSysId, retrieveParams);
        return result;
    } else {
        var fEvtMgmtGetActionsFromRulesDynamic;
        if (!EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            gs.include('EvtMgmtGetActionsFromRules');
            fEvtMgmtGetActionsFromRulesDynamic = new EvtMgmtGetActionsFromRules();
        } else {
            gs.include('sn_em_arm.EvtMgmtGetActionsFromRulesScoped');
            fEvtMgmtGetActionsFromRulesDynamic = new sn_em_arm.EvtMgmtGetActionsFromRulesScoped();
        }
        result = fEvtMgmtGetActionsFromRulesDynamic.getRemediationsAndLaunches(alertSysId, retrieveParams);
    }

    return result;

})(request, response);
