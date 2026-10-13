(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var propertyName = v_query.getCondition('property_name') || '';
        propertyName = propertyName.split('property_name=')[1];
        var response = {};
        var fromDate = vaUtils.safelyGet(decodedFilter.filter, ['from_date'], '');
        var toDate = vaUtils.safelyGet(decodedFilter.filter, ['to_date'], '');
        var dateBucket = vaUtils.safelyGet(decodedFilter.filter, ['date_bucket'], null);
        if (!vaUtils.isValidDate(fromDate) || !vaUtils.isValidDate(toDate) || !dateBucket) {
            CIAnalyticsLogger.getLogger('CountByDate').debug('Unable to load data due to missing/invalid parameter');
            return;
        }
        if (propertyName === 'User Count') {
            response = AnalyticsServiceInvoker.invoke('User', 'getAnalyticsTotalUsersByDate', decodedFilter.filter);
        } else if (propertyName === 'Conversation Count') {
            response = AnalyticsServiceInvoker.invoke('Session', 'getAnalyticsTotalSessionsByDate', decodedFilter.filter);
        }
        response = vaUtils.addMissingDates(fromDate, toDate, response, dateBucket);
        for (var date in response) {
            var count = response[date];
            var gd = new GlideDateTime();
            gd.setDisplayValue(date, 'yyyy-MM-dd');
            var record = {
                date: gd,
                count: count,
                property_name: propertyName,
                sys_id: gs.generateGUID()
            };
            CIAnalyticsLogger.getLogger('CountByDate').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }
})(v_table, v_query);
