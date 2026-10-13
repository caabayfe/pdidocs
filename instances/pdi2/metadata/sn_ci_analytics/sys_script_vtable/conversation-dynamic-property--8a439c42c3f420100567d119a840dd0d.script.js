(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        var propertyName = v_query.getParameter('property_name');
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date,
            property_name_filter: propertyName
        };

        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date) || !propertyName) {
            CIAnalyticsLogger.getLogger('ConversationDynamicProperty').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var response = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsSessionDynamicPropertyValues", body);
        if (response && response[propertyName]) {
            var propertyValues = response[propertyName];
            for (var propertyValue in propertyValues) {
                var record = {
                    sys_id: gs.generateGUID(),
                    property_name: propertyName,
                    property_value: propertyValue,
                    count: propertyValues[propertyValue]
                };
                CIAnalyticsLogger.getLogger('ConversationDynamicProperty').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
