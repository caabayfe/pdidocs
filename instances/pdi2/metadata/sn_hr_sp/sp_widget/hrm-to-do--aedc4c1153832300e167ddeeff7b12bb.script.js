(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */
    data.sysIdURL = $sp.getParameter("sys_id");
    data.canRead = false;
    data.tableName = $sp.getParameter("sysparm_tableName");
    data.todo_sys_id = $sp.getParameter("todo_sys_id");
    if (gs.nil(data.tableName) || gs.nil(data.sysIdURL))
        return;
    data.filter = 'sys_id=' + data.sysIdURL;
    data.isTodoComplete = false;
    data.completedSetHead = gs.getMessage('The {0} set is completed!');
    data.completedSetBody = gs.getMessage('Congratulations on completing this activity set!');
    data.completedJourneyHead = gs.getMessage('This journey is completed!');
    data.completedJourneyBody = gs.getMessage('Congratulations on completing this journey!');
    var record = new GlideRecord(data.tableName);

    record.addQuery('sys_id', data.sysIdURL);
    record.query();
    if (record.next()) {
        data.canRead = hasReadAcces(record);
    }
    if (!data.canRead)
        return;

    var inputOptions = {};
    var util = new sn_hr_sp.todoPageUtils();

    var portalSuffix = new sn_hr_sp.hr_TicketPageConfigUtil().getActivePortalURLSuffix();
    data.todoPageUrl = gs.getProperty("glide.servlet.uri") + portalSuffix + '?id=' + new sn_hr_sp.todoPageUtils().getAllTodoPageId();
    if (!data.todo_sys_id) {
        data.todo_sys_id = util.getTodoConfigSysId(data.tableName, data.sysIdURL);
    }

    data.taskConfigurationSysId = util.getTaskConfiguration(data.todo_sys_id, record);
    inputOptions.tableName = data.tableName; // read from the url
    if (!gs.nil(data.taskConfigurationSysId)) {
        inputOptions.taskSysId = data.sysIdURL;
        inputOptions.taskConfigurationSysId = data.taskConfigurationSysId;
        inputOptions.Url = util.getApprovalHubTaskUrl(data.tableName, data.sysIdURL);
        data.todoLineWidget = $sp.getWidget("task-configuration", inputOptions);
    } else {
        inputOptions.sysId = data.sysIdURL;
        inputOptions.todo_sys_id = data.todo_sys_id;
        data.todoLineWidget = $sp.getWidget("hrm-todos-line-item", inputOptions);
    }

    if (input && input.action == 'addNotification' && new GlidePluginManager().isActive('sn_lp')) {
        var pulseUtils = new sn_lp.PulseUtilsAjax();
        data.taskInfo = pulseUtils.checkForTriggeredConditions ? pulseUtils.checkForTriggeredConditions(input.table, input.taskId) : {};
    }

    if (GlidePluginManager.isActive('com.sn_jny')) {
        var gr = new GlideRecord('sn_hr_le_activity_status');
        if (gr.get('related_record', data.sysIdURL)) {
            var leCase = gr.getElement('activity_set_context.hr_case').toString();
            var journey = new GlideRecord('sn_jny_journey');
            // check if le case is associated with journey
            if (journey.get('le_case', leCase) && journey.canRead())
                data.activitySetCtxID = gr.getValue('activity_set_context');
        }
    }

    function hasReadAcces(record) {
        return (record != null && record.isValid() && record.canRead());
    }

})();
