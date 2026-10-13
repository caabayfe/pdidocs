(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        if (!query)
            return;
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedQuery = vaUtils.decodeFilter(query);
        var filter = decodedQuery.filter;
        var body = {
            from_date: filter.from_date,
            to_date: filter.to_date,
            date_bucket: filter.date_bucket
        };

        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date) || !body.date_bucket) {
            CIAnalyticsLogger.getLogger('SessionDuration').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var response = AnalyticsServiceInvoker.invoke('Session', 'getAnalyticsSessionAverageDurationByDate', body);
        response = vaUtils.addMissingDates(body.from_date, body.to_date, response, body.date_bucket);
        for (var date in response) {
            var duration = response[date];
            var gdr = new GlideDuration(duration);
            var gd = new GlideDateTime();
            gd.setDisplayValue(date, 'yyyy-MM-dd');
            var record = {
                date: gd,
                duration: gdr,
                sys_id: gs.generateGUID()
            };
            CIAnalyticsLogger.getLogger('SessionDuration').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }
})(v_table, v_query);
