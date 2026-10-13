(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date,
            event_type_filter: "Agent Zero Usage",
            property_name_filter: "Usage"
        };
        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date)) {
            CIAnalyticsLogger.getLogger('IssueAutoResolution').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        response = (response && response[body.event_type_filter]) || {};
        var issueAutoResolutionData = response["Issue Auto Resolution"];
        if (issueAutoResolutionData && issueAutoResolutionData.Usage) {
            var issueResolution = issueAutoResolutionData.Usage;
            for (var status in issueResolution) {
                var record = {
                    sys_id: gs.generateGUID(),
                    resolution_status: gs.getMessage(status),
                    count: issueResolution[status]
                };
                CIAnalyticsLogger.getLogger('IssueAutoResolution').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }

    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }
})(v_table, v_query);
