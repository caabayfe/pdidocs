(function executeQuery(v_table, v_query) {
    var AGENT_ZERO_USAGE = "Agent Zero Usage";
    var query = v_query.getEncodedQuery();
    var propertyName = v_query.getParameter('property_name');

    function processAgentZeroTrendData(data, filterParams) {
        var UNRESOLVED = "Unresolved";
        var allUsageData = {}; // To store all the engaged agent-zero data(Resolved + Unresolved)
        for (var propertyValue in data) {
            var propertyValueData = vaDashboardUtils.addMissingDates(filterParams.from_date, filterParams.to_date, data[propertyValue], filterParams.date_bucket);
            for (var date in propertyValueData) {
                allUsageData[date] = allUsageData[date] ? (allUsageData[date] + propertyValueData[date]) : propertyValueData[date];
                /* Agent Zero trend widget is designed to show data only for all the times 
                / that agent zero was engaged (Resolved + Unresolved) and for all the times 
                / the usage was Resolved. */
                if (propertyValue !== UNRESOLVED) {
                    var gd = new GlideDateTime();
                    gd.setDisplayValue(date, 'yyyy-MM-dd');
                    var record = {
                        sys_id: gs.generateGUID(),
                        property_name: propertyName,
                        count: propertyValueData[date],
                        date: gd,
                        property_value: gs.getMessage("Resolved")
                    };
                    CIAnalyticsLogger.getLogger('EventPropertyValueTrend').debugJson('Row data - {}', record);
                    v_table.addRow(record);
                }
            }
        }
        for (var key in allUsageData) {
            var gd = new GlideDateTime();
            gd.setDisplayValue(key, 'yyyy-MM-dd');
            var record = {
                sys_id: gs.generateGUID(),
                property_name: propertyName,
                property_value: gs.getMessage("All Issue Auto Resolution Engaged"),
                date: gd,
                count: allUsageData[key]
            };
            CIAnalyticsLogger.getLogger('EventPropertyValueTrend').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    }

    try {
        var vaDashboardUtils = new sn_ci_analytics.VADashboardUtils();
        var filter = vaDashboardUtils.decodeFilter(query).filter;
        propertyName = propertyName || filter.property_name_filter;
        var body = {
            from_date: filter.from_date,
            to_date: filter.to_date,
            date_bucket: filter.date_bucket,
            event_type_filter: filter.event_type,
            event_name_filter: filter.event_name_filter,
            property_name_filter: propertyName
        };

        if (filter.event_type === 'Topic Category')
            body.date_bucket = filter.date_bucket_channel_usage_trend;

        for (var key in body) {
            if (!body[key])
                return;
        }

        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValuesByDate", body);
        response = response && response[body.event_type_filter];
        if (response) {
            var data = vaDashboardUtils.safelyGet(response, [body.event_name_filter, propertyName], {});

            if (body.event_type_filter === AGENT_ZERO_USAGE) {
                return processAgentZeroTrendData(data, body);
            }

            for (var propertyValue in data) {
                var fullDateList = vaDashboardUtils.addMissingDates(body.from_date, body.to_date, data[propertyValue], body.date_bucket);
                for (var date in fullDateList) {
                    var gd = new GlideDateTime();
                    gd.setDisplayValue(date, 'yyyy-MM-dd');
                    var record = {
                        sys_id: gs.generateGUID(),
                        property_name: propertyName,
                        count: data[propertyValue][date],
                        date: gd,
                        property_value: propertyValue
                    };
                    CIAnalyticsLogger.getLogger('EventPropertyValueTrend').debugJson('Row data - {}', record);
                    v_table.addRow(record);
                }
            }
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
