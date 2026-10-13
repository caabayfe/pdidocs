function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    var requestBody = {
        from_date: vaUtils.safelyGet(input, ['from_date'], ''),
        to_date: vaUtils.safelyGet(input, ['to_date'], ''),
        platform: vaUtils.safelyGet(input, ['platform'], 'chat')
    };
    if (!vaUtils.isValidDate(requestBody.from_date) || !vaUtils.isValidDate(requestBody.to_date)) {
        var result = {
            chartData: []
        };
        CIAnalyticsLogger.getLogger('ConversationTimeSeriesDataByDateRange').debugJson('Data broker result - {}', result);
        return result;
    }
    requestBody.date_bucket = vaUtils.getBucketType(vaUtils.getDays(input.from_date, input.to_date));
    var results = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsTotalSessionsByDate", requestBody);
    if (vaUtils.isEmpty(results)) {
        return [];
    }
    results = vaUtils.addMissingDates(requestBody.from_date, requestBody.to_date, results, requestBody.date_bucket);
    var result = {
        chartData: vaUtils.transformTimeSeries(results)
    };
    CIAnalyticsLogger.getLogger('ConversationTimeSeriesDataByDateRange').debugJson('Data broker result - {}', result);
    return result;
}
