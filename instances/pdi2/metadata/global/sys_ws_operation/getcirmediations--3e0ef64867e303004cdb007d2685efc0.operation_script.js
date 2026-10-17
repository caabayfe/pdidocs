(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    if (request.queryParams.ciId && request.queryParams.bsId) {
        gs.include('EvtMgmtCommons');
        var fEvtMgmtCommons = new EvtMgmtCommons();
        var fIsAMRActivated = gs.getProperty('evt_mgmt.alert.management.activated', 'false'); // Whether AMR is activated
        var fIsScopedARMActive = EvtMgmtAlertMgmtProperties.isARMScopedAppActive(); // Whether ARM scoped app is active or not

        var ciIds;
        if (!request.queryParams.ciIds) {
            ciIds = [];
        } else {
            ciIds = request.queryParams.ciIds[0];
        }
        var ciId = request.queryParams.ciId[0];
        var bsId = request.queryParams.bsId[0];

        var fEvtMgmtGetActionsFromRulesDynamic;
        gs.include('EvtMgmtAlertMgmtMediator');
		var evtMgmtAlertMgmtMediator = new global.EvtMgmtAlertMgmtMediator();

        if (!fIsScopedARMActive) {
            gs.include('EvtMgmtGetActionsFromRules');
            fEvtMgmtGetActionsFromRulesDynamic = new EvtMgmtGetActionsFromRules();
        } else {
            gs.include('sn_em_arm.EvtMgmtGetActionsFromRulesScoped');
            fEvtMgmtGetActionsFromRulesDynamic = new sn_em_arm.EvtMgmtGetActionsFromRulesScoped();
        }

        var onlyCiRemediations = SNC.RemediationScriptableApi.getRemediationForCI(ciId, ciIds, bsId);
        var ciRemediationsObjectsList = evtMgmtAlertMgmtMediator.getRemediationObjectsList(onlyCiRemediations, false, '');
        var relatedCis = SNC.RemediationScriptableApi.getAllRelatedCis(ciId, ciIds, bsId);
		
        var fEvtMgmtAlertMgmtGetActionsFromRulesDynamic;
		
        if (fIsAMRActivated === 'true') {
            if (!fIsScopedARMActive) {
                gs.include('EvtMgmtAlertMgmtGetActionsFromRules');
                fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new EvtMgmtAlertMgmtGetActionsFromRules();
            } else {
                gs.include('sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped');
                fEvtMgmtAlertMgmtGetActionsFromRulesDynamic = new sn_em_arm.EvtMgmtAlertMgmtGetActionsFromRulesScoped();
            }
        }


        //iterate on the alerts of each of the cis
        var gr = new GlideRecord('em_alert');
        gr.addQuery('cmdb_ci', relatedCis);
        gr.addQuery('state', '!=', 'Closed');
        gr.addQuery('severity', '!=', '5'); //'5' is Info
        gr.query();
        var retrieveParams = {
            retrieveLaunchApplications: false,
            retrieveRemediations: true,
            retrieveSubflows: false
        };
        var actionsFromAlerts = [];
        var result;
        while (gr.next()) {
            if (fIsAMRActivated === 'true') { //getting also the legacy remediations when true
                result = fEvtMgmtAlertMgmtGetActionsFromRulesDynamic.getRemediationsAndLaunches(gr.getUniqueValue(), retrieveParams, gr);
            } else {
                result = fEvtMgmtGetActionsFromRulesDynamic.getRemediationsAndLaunches(gr.getUniqueValue(), retrieveParams, gr);
            }
            for (var j = 0; j < result.manualRemediationData.length; j++) {
                actionsFromAlerts.push(result.manualRemediationData[j]);
            }
        }


        //merge the two actions lists:
        var mergedActions = actionsFromAlerts.concat(ciRemediationsObjectsList);

        var getRemediationKey = function(action) {
            return action["workflowId"];
        };
        mergedActions = fEvtMgmtCommons.removeDuplicatesFromList(mergedActions, getRemediationKey);
        return mergedActions;
    }
})(request, response);
