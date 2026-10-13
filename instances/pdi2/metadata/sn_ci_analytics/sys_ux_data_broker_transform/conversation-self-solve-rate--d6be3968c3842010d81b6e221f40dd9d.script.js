function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        return {
            'selfSolveRate': '0%',
            'changeInfo': ''
        };
    }
    //Convert string date in format YYYY-MM-DD to a date object
    var SELF_SOLVE = 'Self Solve';

    var getSelfSolveRate = function(response) {
        var selfSolveData = response && response[SELF_SOLVE];
        if (selfSolveData) {
            var selfSolvedCount = selfSolveData['true'] || 0;
            var totalSolvedCount = selfSolveData['false'] ? selfSolvedCount + selfSolveData['false'] : selfSolvedCount;
            if (totalSolvedCount === 0) {
                return {
                    totalSolvedCount: totalSolvedCount,
                    selfSolvedCount: selfSolvedCount,
                };
            }
            return totalSolvedCount ? (selfSolvedCount / totalSolvedCount) : 0;
        } else {
            return 0;
        }
    };

    var getSelfSolveCount = function(response) {
        var selfSolveData = response && response[SELF_SOLVE];
        if (selfSolveData) {
            var selfSolvedCount = selfSolveData['true'] || 0;
            return selfSolvedCount;
        } else {
            return 0;
        }
    };

    var getRequestBody = function(fromDate, toDate) {
        var requestBody = {};
        requestBody.from_date = fromDate;
        requestBody.to_date = toDate;
        requestBody.platform = 'chat';
        requestBody.property_name_filter = SELF_SOLVE;
        return requestBody;
    };

    var fromDate = input.from_date;
    var toDate = input.to_date;
    var requestBody = getRequestBody(fromDate, toDate);
    var response = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsSessionDynamicPropertyValues", requestBody);
    response = response || {};
    var currentSelfSolveRate = getSelfSolveRate(response);
    var currentSelfSolveCount = getSelfSolveCount(response);
    var currSelfSolvePercentage = vaUtils.toPercentageDisplayValue(currentSelfSolveRate);

    // Get previous stats
    var previousPeriod = vaUtils.getPreviousPeriod(fromDate, toDate);
    requestBody.from_date = previousPeriod.fromDate;
    requestBody.to_date = previousPeriod.toDate;
    response = AnalyticsServiceInvoker.invoke("Session", "getAnalyticsSessionDynamicPropertyValues", requestBody);
    response = response || {};
    var previousSelfSolveRate = getSelfSolveRate(response);
    var previousSelfSolveCount = getSelfSolveCount(response);

    var changeInfo = '';
    var difference = Math.abs(currentSelfSolveCount - previousSelfSolveCount);
    if (difference > 0) {
        changeInfo = vaUtils.numFormatter(difference) + '';
		var selSolveRateDiff = Math.abs(currentSelfSolveRate - previousSelfSolveRate);
		if (previousSelfSolveRate > 0 && selSolveRateDiff > 0) {
            var percentageChange = vaUtils.getDiffInPercentage(currentSelfSolveRate, previousSelfSolveRate);
            var symbol = percentageChange.includes('-') ? '' : '+';
            changeInfo += ' (' + symbol + percentageChange + ')';
        }
    }

    var output = {
        'selfSolveRate': currSelfSolvePercentage,
        'changeInfo': changeInfo
    };

    CIAnalyticsLogger.getLogger('ConversationSelfSolveRate').debugJson('Data broker result - {}', output);

    return output;
}
