function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
	var change = vaUtils.safelyGet(input, ['activeUserQuery', 'change'], '');
    var response = {
        totalUsers: vaUtils.safelyGet(input, ['activeUserQuery', 'totalUsers'], '0'),
		change: change,
        chartData: vaUtils.safelyGet(input, ['activeUserChartQuery'], [])
    };
    return response;
}
