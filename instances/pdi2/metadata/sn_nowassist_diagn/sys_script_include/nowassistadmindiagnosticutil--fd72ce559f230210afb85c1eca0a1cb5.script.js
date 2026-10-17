var NowAssistAdminDiagnosticUtil = Class.create();
NowAssistAdminDiagnosticUtil.prototype = {
    initialize: function() {

    },

    /**
     * @description
     *     Populates troubleshooting metadata for a set of skills, indicating if troubleshoot or monitoring error UI should be shown.
     *     Flags:
     *       - show_troubleshoot: true if any diagnostic script exists for a skill
     *       - show_monitor_errors: true if email monitor errors exist for a skill
     *
     * @param {Array<String>} skillConfigSysIds - Array of sys_ids of skill config records
     * @returns {Object} A map of skill sys_id to flags { show_troubleshoot, show_monitor_errors }
     */
    getTroubleshootDetails: function(skillConfigSysIds) {
        var skillDetailsObj = {};

        // Step 1: Add "show_troubleshoot" for skills with diagnostic scripts
        var diagnScriptGr = new GlideRecord('sn_nowassist_diagn_script_m2m_artifact');
        diagnScriptGr.addQuery('artifact_id', 'IN', skillConfigSysIds);
        diagnScriptGr.query();
        while (diagnScriptGr.next()) {
            var artifactId = diagnScriptGr.getValue('artifact_id');
            var skillData = skillDetailsObj[artifactId] ?? {};
            skillData["show_troubleshoot"] = true;
            skillDetailsObj[artifactId] = skillData;
        }

        // Step 2: Map monitor groups to artifact IDs
        var monitorGroupMapping = {};
        var monitorGroupGr = new GlideRecord('sn_nowassist_diagn_monitor_group');
        monitorGroupGr.addQuery('artifact_id', 'IN', skillConfigSysIds);
        monitorGroupGr.query();
        while (monitorGroupGr.next()) {
            monitorGroupMapping[monitorGroupGr.sys_id] = monitorGroupGr.artifact_id;
        }

        var monitorGroupIds = Object.keys(monitorGroupMapping);
        if (monitorGroupIds.length === 0) {
            return skillDetailsObj; // No monitor groups — return early
        }

        // Step 3: Map monitor configs to monitor groups
        var monitorConfigMapping = {};
        var monitorConfigGr = new GlideRecord('sn_nowassist_diagn_monitor_config');
        monitorConfigGr.addQuery('monitor_group', 'IN', monitorGroupIds);
        monitorConfigGr.query();
        while (monitorConfigGr.next()) {
            monitorConfigMapping[monitorConfigGr.sys_id] = monitorConfigGr.monitor_group;
        }

        var monitorConfigIds = Object.keys(monitorConfigMapping);
        if (monitorConfigIds.length === 0) {
            return skillDetailsObj; // No monitor configs — return early
        }

        // Step 4: Find email-type monitor notifications for configs
        var monitoringLogGr = new GlideRecord('sn_nowassist_diagn_monitor_notification');
        monitoringLogGr.addQuery('notification_type', 'email');
        monitoringLogGr.addQuery('monitor_config', 'IN', monitorConfigIds);
        monitoringLogGr.query();
        while (monitoringLogGr.next()) {
            var monitorConfigId = monitoringLogGr.getValue('monitor_config');
            var monitorGroupId = monitorConfigMapping[monitorConfigId];
            var artifactId = monitorGroupMapping[monitorGroupId];

            if (artifactId) {
                var skillData = skillDetailsObj[artifactId] ?? {};
                skillData["show_monitor_errors"] = true;
                skillDetailsObj[artifactId] = skillData;
            }
        }

        return skillDetailsObj;
    },

    getDiagnosticScriptArr: function(artifactId) {
        try {
            var diagnScriptArr = [];
            if (!gs.nil(artifactId)) {
                var diagnScriptGr = new GlideRecord('sn_nowassist_diagn_script_m2m_artifact');
                diagnScriptGr.addQuery('artifact_id', artifactId);
                diagnScriptGr.query();
                while (diagnScriptGr.next()) {
                    diagnScriptArr.push({
                        "scriptName": diagnScriptGr.getDisplayValue('diagnostic_script'),
                        "scriptId": diagnScriptGr.getValue('diagnostic_script')
                    });
                }
            }
        } catch (error) {
            gs.error("NowAssistAdminDiagnosticUtil : Error in getDiagnosticScriptArr method:", error.toString());
        }
        return diagnScriptArr;
    },

    getMonitoringLogs: function(skillId) {
        var monitoringLogArr = [];
        try {
            if (!gs.nil(skillId)) {
                var monitorGroupGr = new GlideRecord('sn_nowassist_diagn_monitor_group');
                monitorGroupGr.get('artifact_id', skillId);
                if (monitorGroupGr.sys_id) {
                    var monitoringLogGr = new GlideRecord('sn_nowassist_diagn_monitor_notification');
                    monitoringLogGr.addQuery('notification_type', 'email');
                    monitoringLogGr.query();
                    while (monitoringLogGr.next()) {
                        if (monitoringLogGr.monitor_config.monitor_group.artifact_id == skillId)(
                            monitoringLogArr.push({
                                "subject": monitoringLogGr.getDisplayValue('notification_subject'),
                                "message": monitoringLogGr.getDisplayValue('notification_message')
                            }));
                    }
                }
            }
        } catch (error) {
            gs.error("NowAssistAdminDiagnosticUtil : Error in getMonitoringLogs method:", error.toString());
        }
        return monitoringLogArr;
    },

    getExecutionResultIdArr: function(artifactId) {
        var executionResultArr = [];
        try {
            var diagnScriptArr = this.getDiagnosticScriptArr(artifactId);
            if (diagnScriptArr.length > 0) {
                var executionId;
                diagnScriptArr.forEach(function(diagnScript) {
                    if (diagnScript?.scriptId) {
                        var executor = new sn_nowassist_diagn.NowAssistDiagnosticExcecutor();
                        executionId = executor.execute(diagnScript?.scriptId);
                        executionResultArr.push({
                            "scriptName": diagnScript?.scriptName,
                            "executionId": executionId,
                        });
                        executionId = null;
                    }
                });
            }
        } catch (error) {
            gs.error("NowAssistAdminDiagnosticUtil : Error in getExecutionResultIdArr method:", error.toString());
        }
        return executionResultArr;

    },

    getTroubleshootPresentationalListData: function(skillId) {
        var dataArr = [];
        try {
            var executionResultArr = this.getExecutionResultIdArr(skillId);
            if (executionResultArr.length > 0) {
                executionResultArr.forEach(function(executionResult) {
                    var resultArr = [];
                    var executionResultGr = new GlideRecord('sn_nowassist_diagn_execution_result_message');
                    executionResultGr.addQuery('execution_result', executionResult?.executionId);
                    executionResultGr.query();
                    while (executionResultGr.next()) {
                        resultArr.push({
                            "sys_id": executionResultGr.getValue('sys_id'),
                            "resolution": executionResultGr.getValue('resolution'),
                            "message": executionResultGr.getValue('message'),
                        });
                    }
                    dataArr.push({
                        "name": executionResult?.scriptName,
                        "resultArr": resultArr
                    });
                    resultArr = [];
                });

            }
        } catch (error) {
            gs.error("NowAssistAdminDiagnosticUtil : Error in getTroubleshootPresentationalListData method ", error.toString());
        }
        return dataArr;
    },

    type: 'NowAssistAdminDiagnosticUtil'
};
