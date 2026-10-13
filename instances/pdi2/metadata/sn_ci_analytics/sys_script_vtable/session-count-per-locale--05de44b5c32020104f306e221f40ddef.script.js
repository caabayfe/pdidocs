(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        if (!query)
            return;

        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date
        };

        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date)) {
            CIAnalyticsLogger.getLogger('SessionCountPerLocale').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var response = AnalyticsServiceInvoker.invoke('Session', 'getAnalyticsSessionLocale', body);
        for (var key in response) {
            var count = response[key];
            var record = {
                locale: gs.getMessage(key),
                count: count,
                sys_id: gs.generateGUID()
            };
            CIAnalyticsLogger.getLogger('SessionCountPerLocale').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }
})(v_table, v_query);
