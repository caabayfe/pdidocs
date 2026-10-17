function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        var result = {
            totalSessions: '0'
        };
        CIAnalyticsLogger.getLogger('ConversationsPreviousDateRange').debugJson('Data broker result - {}', result);
        return result;
    }
    var previousPeriod = vaUtils.getPreviousPeriod(input.from_date, input.to_date);
	var requestBody = {
        from_date: previousPeriod.fromDate,
        to_date: previousPeriod.toDate,
        platform: vaUtils.safelyGet(input, ['platform'], 'chat')
    };
    var results = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsTotalSessions", requestBody);
    var result = {
        totalSessions: results.TotalSessions
    };
    CIAnalyticsLogger.getLogger('ConversationsPreviousDateRange').debugJson('Data broker result - {}', result);
    return result;
}
