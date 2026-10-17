function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    var previousSessions = vaUtils.safelyGet(input, ['previousSessionTotalQuery', 'totalSessions'], 0);
    var timeSeriesData = vaUtils.safelyGet(input, ['currentSessionTimeSeriesQuery', 'chartData'], []);
    var currentSessions = 0;
    if (timeSeriesData.length) {
        currentSessions = timeSeriesData.reduce(function(a, b) {
            return a + b['y0'];
        }, 0);
    }
   
    var response = {
        totalSessions: currentSessions.toString(),
        change: vaUtils.getChangeInfoTextForScoreCard(currentSessions, previousSessions),
        chartData: timeSeriesData
    };
    return response;
}
