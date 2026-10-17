/**
 ** NOTICE: 
 ** EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
 ** Do NOT add or edit this file - it's here only for backward compatibility.
 ** The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
 **/
var EvtMgmtAlertManagementCommons = Class.create();
EvtMgmtAlertManagementCommons.prototype = {
    initialize: function() {
        this.LAST_EXECUTION_SYS_ID = "last_execution_sys_id";
        this.LAST_EXECUTION_FILTER_MATCH = "last_execution_filter_match";
    },

    type: 'EvtMgmtAlertManagementCommons',

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    shouldAllowUpdateOrDeleteToActionByRecordDomain: function(glideRecord) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().shouldAllowUpdateOrDeleteToActionByRecordDomain(glideRecord);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().shouldAllowUpdateOrDeleteToActionByRecordDomain(glideRecord);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    shouldAllowInsertActionToTheRuleByDomain: function(ruleID) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().shouldAllowInsertActionToTheRuleByDomain(ruleID);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().shouldAllowInsertActionToTheRuleByDomain(ruleID);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    activeActionsExist: function(ruleId) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().activeActionsExist(ruleId);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().activeActionsExist(ruleId);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    activeRemediationExist: function(currentGR) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().activeRemediationExist(currentGR);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().activeRemediationExist(currentGR);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    activeLaunchApplicationExist: function(currentGR) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().activeLaunchApplicationExist(currentGR);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().activeLaunchApplicationExist(currentGR);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    activeFlowExist: function(currentGR) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().activeFlowExist(currentGR);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().activeFlowExist(currentGR);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    getAlertRuleExecutionMap: function(alertsKeys) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().getAlertRuleExecutionMap(alertsKeys);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().getAlertRuleExecutionMap(alertsKeys);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    getExecutionByAlerts: function(alertSysIds) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().getExecutionByAlerts(alertSysIds);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().getExecutionByAlerts(alertSysIds);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    createKeyWithRuleAndAlert: function(alert, rule) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().createKeyWithRuleAndAlert(alert, rule);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().createKeyWithRuleAndAlert(alert, rule);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    addToExecutionsMap: function(alertSysIds, executionsMap, inMemoryRecords) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().addToExecutionsMap(alertSysIds, executionsMap, inMemoryRecords);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().addToExecutionsMap(alertSysIds, executionsMap, inMemoryRecords);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    saveLastExecution: function(key, executionsMap, executionsGR, gdt) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().saveLastExecution(key, executionsMap, executionsGR, gdt);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().saveLastExecution(key, executionsMap, executionsGR, gdt);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    getRuleFromCacheByID: function(ruleId) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().getRuleFromCacheByID(ruleId);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().getRuleFromCacheByID(ruleId);
        }
    },

    // EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
    // The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
    // Do NOT add or edit this file - it's here only for backward compatibility.
    updateExecutionWithTaskRecord: function(executionId, secondsToWait, taskID) {
        if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
            return new sn_em_arm.EvtMgmtAlertMgmtCommons().updateExecutionWithTaskRecord(executionId, secondsToWait, taskID);
        } else {
            return new EvtMgmtAlertManagementCommonsDeprecated().updateExecutionWithTaskRecord(executionId, secondsToWait, taskID);
        }
    }
};

// EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
// The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
// Do NOT add or edit this file - it's here only for backward compatibility.
EvtMgmtAlertManagementCommons.get = function() {
    if (this.isARMScopedAppActive) {
        return new sn_em_arm.EvtMgmtAlertMgmtCommons();
    } else {
        return new EvtMgmtAlertManagementCommonsDeprecated();
    }
};

// EvtMgmtAlertManagementCommons has been DEPRECATED in Rome release.
// The "EvtMgmtAlertMgmtCommons" from "Alert Rules Management" (sn_em_arm) scoped app is the alternative to this file.
// Do NOT add or edit this file - it's here only for backward compatibility.
EvtMgmtAlertManagementCommons.getWhiteListSubflowsQuery = function() {
    if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
        return new sn_em_arm.EvtMgmtAlertMgmtCommons().getWhiteListSubflowsQuery();
    } else {
        return new EvtMgmtAlertManagementCommonsDeprecated().getWhiteListSubflowsQuery();
    }
};
