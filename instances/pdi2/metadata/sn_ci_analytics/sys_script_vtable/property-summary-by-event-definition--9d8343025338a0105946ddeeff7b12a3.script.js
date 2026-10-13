(function executeQuery(v_table, v_query) {
    var LAST_NODE_VISITED = "Last Node Visited";
    var LIVE_AGENT_TRANSFER = "Live Agent Transfer";
    var END_STATE = "End State";
    var EVENT_TYPE_TOPIC_CATEGORY = "Topic Category";
    var query = v_query.getEncodedQuery();
    var propertyName = v_query.getParameter('property_name');

    function getCustomProperty(propertyName, key) {
        switch (propertyName) {
            case LAST_NODE_VISITED:
                return key === "true" ? gs.getMessage("Complete") : gs.getMessage("Incomplete");
            case LIVE_AGENT_TRANSFER:
                return key === "true" ? gs.getMessage("Yes") : gs.getMessage("No");
            default:
                return key;
        }
    }

    function updateTopicCategoryEndStateGreaterThan10Records(response) {
        var rows = [];
        for (propertyValue in response) {
            rows.push({
                property_name: propertyName,
                property_value: propertyValue,
                count: response[propertyValue]
            });
        }

        rows.sort(function(a, b) {
            return b.count - a.count;
        });

        rows.forEach(function(row) {
            var record = {
                property_name: row.property_name,
                property_value: row.property_value,
                count: row.count,
                sys_id: gs.generateGUID()
            };
            CIAnalyticsLogger.getLogger('PropertySummaryByEventDefinition').debugJson('Row data - {}', record);
            v_table.addRow(record);
        });
    }

    function updateTopicCategory(response) {
        var propertyValue;
        for (var category in response) {
            if (propertyName === END_STATE && Object.keys(response[category][propertyName]).length > 10) {
                updateTopicCategoryEndStateGreaterThan10Records(response[category][propertyName]);
            } else {
                for (propertyValue in response[category][propertyName]) {
                    var record = {
                        property_name: propertyName,
                        property_value: getCustomProperty(propertyName, propertyValue),
                        count: response[category][propertyName][propertyValue],
                        sys_id: gs.generateGUID()
                    };
                    CIAnalyticsLogger.getLogger('PropertySummaryByEventDefinition').debugJson('Row data - {}', record);
                    v_table.addRow(record);
                }
            }
        }
    }

    try {

        var vaDashboardUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaDashboardUtils.decodeFilter(query);
        var eventNameFilter = vaDashboardUtils.safelyGet(decodedFilter, ["filter", "event_name_filter"], "");
        var eventType = vaDashboardUtils.safelyGet(decodedFilter, ["filter", "event_type"], "");
        propertyName = propertyName || vaDashboardUtils.safelyGet(decodedFilter, ["filter", "property_name_filter"], "");
        var body = {
            from_date: vaDashboardUtils.safelyGet(decodedFilter, ["filter", "from_date"], ""),
            to_date: vaDashboardUtils.safelyGet(decodedFilter, ["filter", "to_date"], ""),
            event_type_filter: eventType,
            event_name_filter: eventNameFilter,
            property_name_filter: propertyName
        };
        if (!vaDashboardUtils.isValidDate(body.from_date) || !vaDashboardUtils.isValidDate(body.to_date) || !eventNameFilter || !propertyName || !eventType) {
            CIAnalyticsLogger.getLogger('PropertySummaryByEventDefinition').debug('Unable to load data due to missing/invalid parameter');
            return;
        }
        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        response = response && response[body.event_type_filter];
        if (response) {
            if (body.event_type_filter === EVENT_TYPE_TOPIC_CATEGORY) {
                return updateTopicCategory(response);
            }
            var data = vaDashboardUtils.safelyGet(response, [body.event_name_filter, propertyName], {});
            for (var key in data) {
                var record = {
                    sys_id: gs.generateGUID(),
                    property_name: propertyName,
                    count: data[key],
                    property_value: getCustomProperty(propertyName, key)
                };
                CIAnalyticsLogger.getLogger('PropertySummaryByEventDefinition').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
