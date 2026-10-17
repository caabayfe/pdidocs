(function() {
    if (input && input.action == 'load_widget') {
        data.tabWidget = $sp.getWidget(input.tab.widgetId, input.tab.widgetParams);
        return;
    }

    var tableName = $sp.getParameter('table');
    var sysId = $sp.getParameter('sys_id');
    var record = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);
    var disableLazyLoad = gs.getProperty('glide.sc.std_ticket.disable_lazy_load', false);

    data.canRead = (record != null && record.isValid() && record.canRead());
    if (!data.canRead)
        return;

    if ($sp.getParameter('headless') == 'true')
        data.headless = true;
    else if ($sp.getParameter('headless') == 'false')
        data.headless = false;
    else if ($sp.getParameter('headless') == null)
        data.headless = false;
    else
        return;

    data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
    if (isNaN(data.maxAttachmentSize))
        data.maxAttachmentSize = 24;
    data.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} MB - please try again", data.maxAttachmentSize);
    data.widgetLoadingFailedMsg = gs.getMessage("Failed to load widget");
    data.disableRecordWatcher = false;
    data.refreshThrottleThreshold = parseInt(gs.getProperty("glide.sc.std_ticket_tab.refresh_throttle_time", 5000));

    var urClosedState;
    if (tableName == 'universal_request') {
        urClosedState = (record.state == '7');
        if (record.primary_task) {
            var primary_table = record.primary_task.getRefRecord().getTableName();
            record = sn_std_tkt_api.TicketConfig.getTicketRecord(primary_table, record.primary_task);
            data.canRead = record != null && record.isValid() && record.canRead();
            if (!data.canRead)
                return;
        }
    } else if (record.isValidField('universal_request') && !record.universal_request.nil())
        urClosedState = (record.universal_request.state == '7');

    data.table = record.getTableName();
    data.sys_id = record.getUniqueValue();

    var tabs = [];
    var config = sn_std_tkt_api.TicketConfig.getConfig(data.table, record.sys_domain);
    var isNonPrimary = ((record.isValidField('universal_request') && !record.universal_request.nil()) && (record.universal_request.primary_task != record.sys_id));
    var activityWidgetId = 'std_ticket_conversations';
    var attachmentsWidgetId = 'std_ticket_attachments';
    var activityParams = {
        sys_id: data.sys_id,
        table: data.table,
        btnLabel: gs.getMessage('Post'),
        read_only: isNonPrimary || urClosedState,
        rich_text_editor: options.rich_text_editor,
        at_mentions: options.at_mentions,
        displayFilter: options.displayFilter
    };
    var attachmentsWidgetParams = {
        record_id: data.sys_id,
        record_table: data.table,
        read_only: isNonPrimary || urClosedState
    };

    if (!config.tabs) {
        var tab_1 = {
            name: gs.getMessage('Activity'),
            order: 0,
            widgetId: activityWidgetId,
            widgetParams: activityParams
        };
        tabs.push(tab_1);
        var tab_2 = {
            name: gs.getMessage('Attachments'),
            order: 1,
            widgetId: attachmentsWidgetId,
            widgetParams: attachmentsWidgetParams
        };
        tabs.push(tab_2);
    } else {
        config.tabs.forEach(function(tabConfig) {
            var tab = {};
            tab.name = tabConfig.name;
            tab.type = tabConfig.type;
            var condition = tabConfig.visible_condition;
            var isAdvCondition = tabConfig.advanced;
            var scriptCondition = tabConfig.visible_script;

            if (isAdvCondition) {
                if (scriptCondition) {
                    var evaluator = new GlideScopedEvaluator();
                    var tagGR = sn_std_tkt_api.TicketConfig.getTicketRecord('ticket_tab_configuration', tabConfig.sys_id);
                    evaluator.putVariable('current', record);
                    evaluator.putVariable('answer', null);
                    var response = evaluator.evaluateScript(tagGR, 'script');
                    if (typeof response !== 'undefined' && !(response == 'true' ||
                            response == true ||
                            response.answer ||
                            response.answer == 'true' ||
                            response.answer == true)) //either the script could return true, or set answer to true
                        return;

                }
            } else {
                if (condition) {
                    if (!GlideFilter.checkRecord(record, condition))
                        return;
                }
            }

            switch (tabConfig.type) {
                case 'activity':
                    tab.widgetId = activityWidgetId;
                    tab.widgetParams = activityParams;
                    break;
                case 'attachments':
                    tab.widgetId = attachmentsWidgetId;
                    tab.widgetParams = attachmentsWidgetParams;
                    break;
                case 'associated_requests':
                    tab.widgetId = 'my-requests-v2';
                    tab.widgetParams = {
                        record_id: data.sys_id,
                        record_table: data.table,
                        is_associated_ticket_tab: true
                    };
                    break;
                case 'variable_editor':
                case 'variable_summary':
                    if (record.variables.getElements(true).length == 0)
                        return;
                    var widgetParams = tabConfig.widget_param;
                    if (widgetParams)
                        widgetParams = JSON.parse(widgetParams);
                    else
                        widgetParams = {};
                    widgetParams.table = data.table;
                    widgetParams.sys_id = data.sys_id;
                    tab.widgetId = tabConfig.widget;
                    tab.widgetParams = widgetParams;
                    break;
                case 'custom':
                    var widgetParams = tabConfig.widget_param;
                    if (widgetParams)
                        widgetParams = JSON.parse(widgetParams);
                    else
                        widgetParams = {};
                    widgetParams.table = data.table;
                    widgetParams.sys_id = data.sys_id;
                    widgetParams.read_only = isNonPrimary || urClosedState;
                    data.disableRecordWatcher = widgetParams.disableStdRecordWatcher == "true" || data.disableRecordWatcher;
                    tab.widgetId = tabConfig.widget;
                    tab.widgetParams = widgetParams;
                    break;
                case 'iar_recommendations':
                    tab.widgetId = 'iar_recommendation';
                    tab.widgetParams = {
                        record_id: data.sys_id,
                        record_table: data.table
                    };
                    break;

            }
            tab.order = tabConfig.order;
            tabs.push(tab);
        });
    }
    //laod widget for first tab
    if (tabs.length > 0)
        tabs[0].widget = $sp.getWidget(tabs[0].widgetId, tabs[0].widgetParams);
    if (disableLazyLoad === 'true') {
        for (var i = 1; i < tabs.length; i++) {
            tabs[i].widget = $sp.getWidget(tabs[i].widgetId, tabs[i].widgetParams);
        }
    }
    data.tabs = tabs;

})();
