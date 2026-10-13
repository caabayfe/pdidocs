/**
*
*
*
*
*
* NOTICE: 
**********
* EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
*
* Do NOT add or edit this file - it's here only for backward compatibility.
*
* The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
*
*
*
*
*
**/
var EvtMgmtAlertManagementCommonsDeprecated = Class.create();
EvtMgmtAlertManagementCommonsDeprecated.prototype = {
    initialize: function() {
        this.evtMgmtCommons = new EvtMgmtCommons();
        this.alertSysIdsQueryLimit = gs.getProperty('evt_mgmt.alert.management.sys_id_in_query_limit', 1000);
        this.maximumExecutionsInMemory = gs.getProperty('evt_mgmt.alert.management.executions_in_memory', 1000000);
        this.LAST_EXECUTION_SYS_ID = "last_execution_sys_id";
        this.LAST_EXECUTION_FILTER_MATCH = "last_execution_filter_match";
        this.LAST_EXECUTION_CREATED_ON = "last_execution_created_on";
    },

    type: 'EvtMgmtAlertManagementCommonsDeprecated',

    //Find rather the current user can update the action- only a user in the action's domain can update it
    shouldAllowUpdateOrDeleteToActionByRecordDomain: function(glideRecord) {
        var userDomain = this.evtMgmtCommons.getCurrentDomainID();
        var recordDomain = this.evtMgmtCommons.getRecordDomain(glideRecord);
        return (userDomain === recordDomain);
    },

    //Find rather the current user can add a new actions to this rule-  only a user in the rules's domain can update it
    shouldAllowInsertActionToTheRuleByDomain: function(ruleID) {
        var ruleGR = new GlideRecord("em_alert_management_rule");
        if (ruleGR.get(ruleID)) {
            return (this.shouldAllowUpdateOrDeleteToActionByRecordDomain(ruleGR));
        } else {
            return true; //If didn't found the rule, it's probably a new rule
        }
    },


    //Find rather there are active actions to this rule
    activeActionsExist: function(ruleId) {

        //find if there are flows
        var gr = new GlideRecord("em_alert_management_action");
        gr.addQuery("management_rule", ruleId);
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    //Find rather there are active remediation with the same id to this rule
    activeRemediationExist: function(currentGR) {

        var gr = new GlideRecord("em_alert_man_m2m_rule_workflow");
        gr.addQuery("sys_id", "!=", currentGR.getUniqueValue());
        gr.addQuery("management_rule", currentGR.management_rule);
        gr.addQuery("workflow", currentGR.workflow);
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    //Find rather there are active launch application with the same name or URL to this rule
    activeLaunchApplicationExist: function(currentGR) {

        var gr = new GlideRecord("em_launch_application");
        gr.addQuery("sys_id", "!=", currentGR.getUniqueValue());
        gr.addQuery("management_rule", currentGR.management_rule);
        var condition = gr.addQuery('display_name', '=', currentGR.display_name);
        gr.appendOrQuery(condition, 'url', '=', currentGR.url);
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    //Find rather there are active flows with the same id to this rule
    activeFlowExist: function(currentGR) {

        var gr = new GlideRecord("em_alert_man_m2m_rule_flow");
        gr.addQuery("sys_id", "!=", currentGR.getUniqueValue());
        gr.addQuery("management_rule", currentGR.management_rule);
        gr.addQuery("sub_flow", currentGR.sub_flow);
        gr.addActiveQuery();
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    //Create map with alert_rule executions
    getAlertRuleExecutionMap: function(alertsKeys) {
        var alertSysIds = [];
        var alertCounter = 0;
        var inMemoryRecords = 0;
        var executionsMap = {};
        for (var i = 0; i < alertsKeys.length; i++) {
            alertSysIds.push(alertsKeys[i]);
            alertCounter++;
            if (this.alertSysIdsQueryLimit <= alertCounter) {
                inMemoryRecords = this.addToExecutionsMap(alertSysIds, executionsMap, inMemoryRecords);
                alertSysIds = [];
                alertCounter = 0;
                if (inMemoryRecords >= this.maximumExecutionsInMemory) {
                    //exceeding number of in memory records
                    break;
                }

            }

        }
        if (alertCounter > 0) {
            this.addToExecutionsMap(alertSysIds, executionsMap, inMemoryRecords);
        }
        return executionsMap;
    },

    getExecutionByAlerts: function(alertSysIds) {
        var executions = new GlideRecord('em_alert_management_execution');
        executions.addQuery('alert', 'IN', alertSysIds);
        executions.addQuery('historical', false);
        executions.addQuery('automatic_run', true);
        executions.query();
        return executions;

    },
    createKeyWithRuleAndAlert: function(alert, rule) {
        return alert + "_" + rule;
    },

    addToExecutionsMap: function(alertSysIds, executionsMap, inMemoryRecords) {
        var executionsGR = this.getExecutionByAlerts(alertSysIds);
        while (executionsGR.next()) {
            if (inMemoryRecords < this.maximumExecutionsInMemory) {
                var key = this.createKeyWithRuleAndAlert(executionsGR.getValue("alert"), executionsGR.getValue("management_rule"));
                var actionName = executionsGR.getValue('rule_action');
                if (!executionsMap.hasOwnProperty(key)) {
                    executionsMap[key] = {};
                    executionsMap[key][actionName] = 0;
                    executionsMap[key][this.LAST_EXECUTION_CREATED_ON] = new GlideDateTime(0);
                }
                if (executionsMap[key][actionName]) {
                    executionsMap[key][actionName]++;
                } else {
                    // new action
                    executionsMap[key][actionName] = 1;
                    inMemoryRecords++;
                }
                var gdt = new GlideDateTime(executionsGR.sys_created_on);
                var compare = gdt.compareTo(executionsMap[key][this.LAST_EXECUTION_CREATED_ON]);
                if (compare > 0) {
                    this.saveLastExecution(key, executionsMap, executionsGR, gdt);
                } else if (compare == 0) { // both execfutions records created at the same time. Continue compare by sys_id
                    if ((executionsGR.sys_id + "") > executionsMap[key][this.LAST_EXECUTION_SYS_ID]) {
                        this.saveLastExecution(key, executionsMap, executionsGR, gdt);
                    }
                }
            } else {
                gs.error("The maximum number of execution we keep in memory is " + this.maximumExecutionsInMemory + " we are breaching it, hence we will not load more execution to memory");
                break;
            }
        }

        if (this.evtMgmtCommons.isDebugEnabled()) {
            this.evtMgmtCommons.addDebugMessage("Execution map is: " + JSON.stringify(executionsMap));
        }

        return inMemoryRecords;
    },

    saveLastExecution: function(key, executionsMap, executionsGR, gdt) {
        //chane types to string since sometimes it deos problems (it acts to true as false)
        executionsMap[key][this.LAST_EXECUTION_SYS_ID] = (executionsGR.sys_id) + "";
        executionsMap[key][this.LAST_EXECUTION_FILTER_MATCH] = executionsGR.filter_always_match + "";
        executionsMap[key][this.LAST_EXECUTION_CREATED_ON] = gdt;

        //Used for DEBUG
        if (this.evtMgmtCommons.isDebugEnabled()) {
            executionsMap[key][this.LAST_EXECUTION_CREATED_ON + "_STR"] = gdt + "";
        }
    },

    //Find rather there are active actions to this rule
    getRuleFromCacheByID: function(ruleId) {
        var alertManager = new SNC.AlertManager();
        var relevantRules = alertManager.getReleveantAlertRules();
        for (var i = 0; i < relevantRules.length; i++) {
            if ((relevantRules[i].getSysId() + "") === (ruleId + "")) {
                return relevantRules[i];
            }
        }

        return null;
    },

    updateExecutionWithTaskRecord: function(executionId, secondsToWait, taskID) {
        if (GlideStringUtil.nil(executionId)) {
            gs.warn("On 'EvtMgmtCommons.waitTillExecutionRecordCreated' subflow. Didn't got any executionId. Can't get record.");
            return;
        }

        var executionRecord = new GlideRecord("em_alert_management_execution");
        var found = executionRecord.get(executionId);
        var counter = 0;
        while ((counter < secondsToWait) && (!found)) {
            gs.info("Sleep for a second on 'EvtMgmtCommons.waitTillExecutionRecordCreated' subflow. Execution Record with ID '" + executionId + "' wasn't found after " + counter + " seconds.");
            gs.sleep(1000);
            counter++;
            found = executionRecord.get(executionId);
        }

        if (!found) {
            gs.warn("On 'EvtMgmtCommons.waitTillExecutionRecordCreated' subflow. Execution Record with ID '" + executionId + "' wasn't found after " + counter + " seconds.");
        } else {
            executionRecord.related_task = taskID;
            executionRecord.update();
        }

    }
};

EvtMgmtAlertManagementCommonsDeprecated.get = function() {
    return new EvtMgmtAlertManagementCommonsDeprecated();
};

//for domain separation, getting the query of the allowed subflows by the white list
EvtMgmtAlertManagementCommonsDeprecated.getWhiteListSubflowsQuery = function() {
    var query = "type=subflow^active=true";
    if (GlideProperties.get("glide.sys.domain.partitioning", 'false') == 'true') {
        var whiteListGR = new GlideRecord('em_ds_subflow_white_list');
        whiteListGR.query();
        var subflowsSysIds = '^sys_idIN';
        var notFirst = false;
        while (whiteListGR.next()) {
            if (notFirst) {
                subflowsSysIds += ',';
            }
            subflowsSysIds += whiteListGR.sub_flow;
            notFirst = true;
        }
        if (!notFirst) //whiteListGR has no records
            gs.warn('The white list of the subflows for domain separation is empty (em_ds_subflow_white_list), therefore the subflows table of the alert management rules will be empty, you need to add the supported subflows to the white list, so the subflows will be visible from the alert management subflows table.');
        query += subflowsSysIds;
    }
    return query + "^EQ";
};
