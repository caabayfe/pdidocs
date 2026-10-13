(function executeQuery(v_table, v_query) {
    var ACTIONABLE_NOTIFICATION = "Actionable Notification";
    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date,
            property_name_filter: "State",
            event_type_filter: ACTIONABLE_NOTIFICATION
        };
        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date)) {
            CIAnalyticsLogger.getLogger('ActionableNotifications').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        response = (response && response[body.event_type_filter]) || {};
        var actionableNotificationData = response[ACTIONABLE_NOTIFICATION];
        if (actionableNotificationData && actionableNotificationData.State) {
            var notificationState = actionableNotificationData.State;
            for (var state in notificationState) {
                var record = {
                    sys_id: gs.generateGUID(),
                    state: gs.getMessage(state),
                    count: notificationState[state]
                };
                CIAnalyticsLogger.getLogger('ActionableNotifications').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }
    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }
})(v_table, v_query);
