(function() {
    var util = new sn_ex_sp.ApprovalHubUtil();
    if (input && input.action == "loadCommonAndPrimaryInfo" && input.taskObj) {
        data.taskConfigData = input.taskConfigData;
        var taskConfigGr = new GlideRecord('sn_ex_sp_task_configuration');
        if (taskConfigGr.get(input.taskObj.taskConfigurationSysId) && Boolean(taskConfigGr.active)) {
            var record = util.getTableRecord(taskConfigGr, input.taskObj.taskSysId);
            data.taskConfigData.commonInfo = util.getCommonInfo(record, input.taskObj.taskSysId);
            data.taskConfigData.primaryInfo = util.getPrimaryInfo(record);
            data.taskConfigData.actions = util.getActionsInfo(taskConfigGr, input.taskObj.taskSysId);
            setCommonInfoWidget(input.taskObj);
            setPrimaryInfoWidget(input.taskObj);
            setActionsWidget();
        }
    } else {
        data.taskObj = {
            taskSysId: input && input.taskSysId ? input.taskSysId : options.taskSysId,
            taskConfigurationSysId: input && input.taskConfigurationSysId ? input.taskConfigurationSysId : options.taskConfigurationSysId,
            widgetSpan: input && input.widgetSpan ? input.widgetSpan : options.widgetSpan,
            tableName: input && input.tableName ? input.tableName : options.tableName,
            tabName: input && input.tabName ? input.tabName : options.tabName
        };
        data.taskConfigData = util.getTaskConfigurationData(data.taskObj.taskConfigurationSysId, data.taskObj.taskSysId);
        if (data.taskConfigData) {
            setCommonInfoWidget(data.taskObj);
            setPrimaryInfoWidget(data.taskObj);
            setSecondaryInfoWidget(data.taskObj.tabName);
            setActionsWidget();
            setAISummaryWidget(data.taskConfigData.referenceTableGr, data.taskObj.tabName != 'open');
        }
    }

    function setCommonInfoWidget(taskObj) {
        if (data.taskConfigData.commonInfo) {
            data.taskConfigData.commonInfo.url = '';
            if (data.taskConfigData.commonInfo.linkToTask) {
                if (!taskObj.url) {
                    if (data.taskConfigData.commonInfo.Url) {
                        taskObj.url = data.taskConfigData.commonInfo.Url;
                    } else {
                        taskObj.url = input && input.Url ? input.Url : options.Url;
                    }
                }
                data.taskConfigData.commonInfo.url = taskObj.url;
            }
            data.commonInfoWidget = $sp.getWidget('common-info', data.taskConfigData.commonInfo);
        }
    }

    function setPrimaryInfoWidget(taskObj) {
        if (data.taskConfigData.primaryInfo) {
            data.taskConfigData.primaryInfo.widgetSpan = taskObj.widgetSpan;
            data.taskConfigData.primaryInfo.tableName = taskObj.tableName;
            data.taskConfigData.primaryInfo.sysId = taskObj.taskSysId;
            data.primaryInfoWidget = $sp.getWidget('primary-info', data.taskConfigData.primaryInfo);
        }
    }

    function setSecondaryInfoWidget(tabName) {
        if (data.taskConfigData.secondaryInfo) {
            data.taskConfigData.secondaryInfo.tabName = tabName;
            data.secondaryInfoWidget = $sp.getWidget('secondary-info', data.taskConfigData.secondaryInfo);
        }
    }

    function setActionsWidget() {
        if (data.taskConfigData.actions && data.taskConfigData.actions.groupId) {
            data.actionsWidget = $sp.getWidget("action-widget", {
                table: data.taskConfigData.actions.table,
                context: data.taskConfigData.actions.sysId,
                action_group: data.taskConfigData.actions.groupId,
                button_direction_reversed: true,
                max_button_count: 3,
                primary_colored_button: true,
                more_icon: 'fa-ellipsis-v'
            });
        }
    }

function isEmpGenAiActiveAndUpgraded() {
    var pluginActive = new GlidePluginManager().isActive("com.sn_ex_gen_ai");
    try {
        if (pluginActive && new sn_ex_gen_ai.PortalTaskSummarize()) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function setAISummaryWidget(referenceTableGr, isTaskComplete) {
    if (!isEmpGenAiActiveAndUpgraded() || !referenceTableGr) {
        return;
    }
    data.aiSummaryWidget = $sp.getWidget("ai-record-summary", {
        table: referenceTableGr.getTableName(),
        sys_id: referenceTableGr.getUniqueValue(),
        isTaskComplete: isTaskComplete
    });
}

})();
