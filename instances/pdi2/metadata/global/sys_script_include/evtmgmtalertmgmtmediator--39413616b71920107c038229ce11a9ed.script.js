var EvtMgmtAlertMgmtMediator = Class.create();
EvtMgmtAlertMgmtMediator.prototype = {
    type: 'EvtMgmtAlertMgmtMediator',

    initialize: function() {
        this.alertManager = new SNC.AlertManager();
        this.remediationScriptableApi = SNC.RemediationScriptableApi;
        this.flowAPI = sn_fd.FlowAPI;
        this.searchRequest = new SNC.SearchRequest();
        this.batchUtil = new SNC.BatchCommandsUtil();
        this.eventRuleManager = new SNC.EventRuleManager();
        this.serviceAnalyticsProcessor = new SNC.ServiceAnalyticsProcessor();
    },
	
	
	// AlertManager functions
	getReleveantAlertRules: function() {
		return this.alertManager.getReleveantAlertRules();
	},
	
	parseURLForTools: function(alertGR, launchApplications) {
		return this.alertManager.parseURLForTools(alertGR, launchApplications);
	},
	
	executeSubflow: function(actionFullName, recordDomain, inputs) {
		return this.alertManager.executeSubflow(actionFullName, recordDomain, inputs);
	},
	
	getAlertsSysIds: function(alertsGR) {
		return this.alertManager.getAlertsSysIds(alertsGR);
	},
	
	getIncidentCreatingJobUser: function() {
		return this.alertManager.getIncidentCreatingJobUser();
	},
	
	setSessionUser: function(user) {
		return this.alertManager.setSessionUser(user);
	},
	
	updateWorkNotesOnAlert: function(gr, worknotes) {
		return this.alertManager.updateWorkNotesOnAlert(gr, worknotes);
	},
	
	currentUpdateWithoutRecursiveCalls: function(current) {
        current.setWorkflow(false); //disable all business rules execution
        current.update(); //updating my record
        current.setWorkflow(true); //enable again all business rules execution
    },
	
	getToolsForAlert: function(alertSysId) {
		return this.alertManager.getToolsForAlert(alertSysId);
	},
	
	checkRecord: function(alertGR, alertFilter) {
        return GlideFilter.checkRecord(alertGR, alertFilter);
    },
	
	// RemediationScriptableApi functions
	startRemediationReturnTaskId: function(alertSysid, cmdbCi, refActionId) {
		return this.remediationScriptableApi.startRemediationReturnTaskId(alertSysid, cmdbCi, refActionId);
	},
	
	getManualRemediationActionsForAlert: function(alertSysId) {
		return this.remediationScriptableApi.getManualRemediationActionsForAlert(alertSysId);
	},
	
	
	// sn_fd.FlowAPI functions
	startSubflowSkipInputValidation: function(actionFullName, inputs) {
		return this.flowAPI.startSubflowSkipInputValidation(actionFullName, inputs);
	},


    //SearchRequest functions
    submitSearchRequest: function(searchText, numberOfResults) {
        try {
            this.searchRequest.query.freetext = searchText;
            this.searchRequest.meta.window.start = 0;
            this.searchRequest.meta.window.end = numberOfResults;

            var searchResponse = this.searchRequest.submit();
            var result = new JSON().decode(searchResponse.toJSON());
            return result;
        } catch (e) {
			var errorMessage = new global.EvtMgmtCommons().getExceptionMessage(e, true);
            gs.error(errorMessage);

            return null;
        }

    },
	
	executeSubflowSync: function(actionFullName, inputs) {
		var result =  sn_fd.FlowAPI.getRunner().subflow(actionFullName).inForeground().withInputs(inputs).run();
		return result.getContextId();
	},
		
	//moving this function from scoped app because this list is an array that contains JAVA instances of 'com.snc.sw.remediation.Remediation' class, which then can't be iterated from a scoped app
	getRemediationObjectsList: function(remediationsList, isFromAlertManagement, alertSysId) {
        var manualRemediationsArray = [];
        for (var index = 0; index < remediationsList.length; index++) {
            var manualRemediationOBJ = {};
            if (isFromAlertManagement) {
                manualRemediationOBJ.workflowId = remediationsList[index].action.getWorkflowId();
                manualRemediationOBJ.workflowName = remediationsList[index].action.getWorkflowName();
                manualRemediationOBJ.actionId = remediationsList[index].action.getActionSysid();
                manualRemediationOBJ.rule = remediationsList[index].rule;
                manualRemediationOBJ.alertManagementRule = true;
                manualRemediationOBJ.ruleOrder = remediationsList[index].ruleOrder;
                manualRemediationOBJ.ruleName = remediationsList[index].ruleName;
            } else {
                manualRemediationOBJ.workflowId = remediationsList[index].getWorkflowId();
                manualRemediationOBJ.workflowName = remediationsList[index].getWorkflowName();

            }
            manualRemediationOBJ.alertSysId = alertSysId;
            manualRemediationsArray.push(manualRemediationOBJ);
        }
        return manualRemediationsArray;
    },
	
	//batchUtil functions
    batchInsertMultiple: function(jsonArr, tableName, domainId) {
        return this.batchUtil.batchInsertMultiple(jsonArr, tableName, domainId);
    },
    batchUpdateMultiple: function(jsonArr, tableName, domainId) {
        return this.batchUtil.batchUpdateMultiple(jsonArr, tableName, domainId);
    },

	//eventRuleManager functions
    eventsMatchFilter: function(eventIds, ruleJson) {
        return this.eventRuleManager.eventsMatchFilter(eventIds, ruleJson);
    },

    //ServiceAnalyticsProcessor functions
    simulateGrouping: function(simulationPayload) {
        this.serviceAnalyticsProcessor.simulateGrouping(simulationPayload);
    }
};
