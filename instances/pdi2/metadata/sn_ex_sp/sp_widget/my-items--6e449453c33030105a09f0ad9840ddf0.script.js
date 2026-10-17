(function() {

    data.load_config = options.load_config;
    data.asyncLoad = options.async_load || false;
    if (!data.asyncLoad && data.load_config === "async" && !input)
        return;
    data.card_behaviour = options.card_behaviour;
    data.instanceId = $sp.getDisplayValue("sys_id");

    var stats = {};
    stats.callerId = instanceId;
    stats.textPrefix = 'My Items';
    stats.shortDesc = 'Load Data';
    stats.guid = gs.generateGUID();

    try {
        var portalRecord = $sp ? $sp.getPortalRecord() : '';
        var portalId = portalRecord ? portalRecord.sys_id : '';
        data.recordLimit = options.list_view_count;
        data.showViewDetails = options.show_view_details;
        data.showIcons = options.show_icons;

        var grInstanceRecord = $sp ? $sp.getInstanceRecord() : '';
        var instanceId = grInstanceRecord ? grInstanceRecord.getUniqueValue() : '';
        stats.startTime = new GlideDateTime();
        var liteView = (options.widget_behavior_during_high_load == "lite_view") && new sn_ex_emp_fd.PortalPerformanceUtil().getNodeStatus();

        var activityConfigUtil = new sn_ex_sp.ActivityConfigurationUtil();
        data.activityDetails = activityConfigUtil.getActivityData(data.recordLimit, instanceId, portalId, liteView, stats.guid);
        //Map actions with associated card
        for (var cardDataIndex = 0; cardDataIndex < data.activityDetails.listViewData.length; cardDataIndex++) {
            var currCardData = data.activityDetails.listViewData[cardDataIndex];
            currCardData.title = currCardData.title ? GlideStringUtil.unEscapeHTML(currCardData.title) : "";
            currCardData.description = currCardData.description ? GlideStringUtil.unEscapeHTML(currCardData.description) : "";
            currCardData.field1Value = currCardData.field1Value ? GlideStringUtil.unEscapeHTML(currCardData.field1Value) : "";
            currCardData.field2Value = currCardData.field2Value ? GlideStringUtil.unEscapeHTML(currCardData.field2Value) : "";
            if (currCardData.actionsWidgetDetail) {
                var context = currCardData.actionsWidgetDetail.parentRecordSysId;

                var actionsWidget = $sp.getWidget("action-widget", {
                    table: currCardData.actionsWidgetDetail.parentTable,
                    context: context,
                    action_group: currCardData.actionsWidgetDetail.actionGrpSysId,
                    max_button_count: 2,
                    primary_colored_button: true,
                    more_icon: 'fa-ellipsis-v'
                });

                currCardData.actionsWidget = actionsWidget;
                currCardData.actionsContext = context;
                currCardData.isActionWidgetVisible = true;
            }
        }

        data.title = gs.getMessage("My active items");

        if (data.activityDetails.listViewData && data.activityDetails.listViewData.length > 0) {

            var isSessionLangGerman = gs.getSession().getLanguage() == "de";
            var itemName = data.activityDetails.primaryCountData.length > 0 ? data.activityDetails.primaryCountData[0].itemName : undefined;
            //Nouns always start with capital letter in German
            itemName = isSessionLangGerman ? itemName : itemName.toLowerCase();

            data.listCountSummary = gs.getMessage("Showing {0} of {1} {2}",
                [data.activityDetails.listViewData.length.toString(),
                    data.activityDetails.primaryCountData[0].itemCount.toString(), itemName
                ]);
            data.noOfCards = data.activityDetails.listViewData.length;
        }
        data.hideWidget = false;

        new sn_ex_sp.PerformanceIndicatorUtil().postInstanceHotspot(stats);

        return data;
    } catch (e) {
        data.hideWidget = true;
        gs.addErrorMessage(gs.getMessage("Error in loading the My Items widget"));
        return data;
    }

})();
