function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        var emptyResult = [];
        CIAnalyticsLogger.getLogger('ActiveUserTimeSeries').debug('Data broker result - ' + emptyResult);
        return emptyResult;
    }
    var requestBody = {
        from_date: vaUtils.safelyGet(input, ['from_date'], ''),
        to_date: vaUtils.safelyGet(input, ['to_date']),
        platform: vaUtils.safelyGet(input, ['platform'], 'chat')
    };
    requestBody.date_bucket = vaUtils.getBucketType(vaUtils.getDays(requestBody.from_date, requestBody.to_date));
    var currentDurationActiveUsersTimeSeries = AnalyticsServiceInvoker.invoke("User", "getAnalyticsTotalUsersByDate", requestBody);
    if (vaUtils.isEmpty(currentDurationActiveUsersTimeSeries)) {
        return [];
    }
    currentDurationActiveUsersTimeSeries = vaUtils.addMissingDates(requestBody.from_date, requestBody.to_date, currentDurationActiveUsersTimeSeries, requestBody.date_bucket);
    var result = vaUtils.transformTimeSeries(currentDurationActiveUsersTimeSeries);
    CIAnalyticsLogger.getLogger('ActiveUserTimeSeries').debugJson('Data broker result - {}', result);
    return result;
}
