function transform(input) {
    var _platform = input.platform;
    var _result = {
        totalUsers: 0,
        change: ''
    };

    // Validate input
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date) || !input.platform)
        return _result;

    // Get AnalyticsTotalUsers from Appsee
    function getTotalUsers(fromDate, toDate) {
        var _totalUsers = 0;
        try {
            var response = AnalyticsServiceInvoker.invoke('User', 'getAnalyticsTotalUsers', {
                from_date: fromDate,
                to_date: toDate,
                platform: input.platform
            });
            if (response && response.TotalUsers)
                _totalUsers = response.TotalUsers;
        } catch (e) {
            gs.error('AnalyticsService - Error fetching total active users : ' + e);
        }
        return _totalUsers;
    }

    var previousPeriod = vaUtils.getPreviousPeriod(input.from_date, input.to_date);
    var currentDurationActiveUsers = getTotalUsers(input.from_date, input.to_date);
    var previousDurationActiveUsers = getTotalUsers(previousPeriod.fromDate, previousPeriod.toDate);

    _result.totalUsers = currentDurationActiveUsers;
    _result.change = vaUtils.getChangeInfoTextForScoreCard(currentDurationActiveUsers, previousDurationActiveUsers);

    CIAnalyticsLogger.getLogger('ActiveUserCount').debugJson('Data broker result - {}', _result);

    return _result;

}
