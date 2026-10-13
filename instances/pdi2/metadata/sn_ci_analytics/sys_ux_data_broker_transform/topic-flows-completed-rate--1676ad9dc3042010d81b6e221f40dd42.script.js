function transform(input) {
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(input.from_date) || !vaUtils.isValidDate(input.to_date)) {
        return {
            'topicCompletionRate': '0%',
            'changeInfo': ''
        };
    }
    //Convert string date in format YYYY-MM-DD to a date object
    var STANDARD = 'STANDARD';

    var getRequestBody = function(fromDate, toDate) {
        var requestBody = {};
        requestBody.from_date = fromDate;
        requestBody.to_date = toDate;
        requestBody.platform = 'chat';
        requestBody.event_type_filter = 'Topic';
        return requestBody;
    };

    var getTopicCompletionRate = function(response) {
        if (response) {
            var totalTopicExecuted = 0;
            var totalTopicCompleted = 0;
            for (var key in response) {
                var topic = response[key];
                var subCategory = topic && topic['Sub Category'];
                var topicExecuted = subCategory && subCategory[STANDARD] && parseInt(subCategory[STANDARD]);
                if (topicExecuted) {
                    totalTopicExecuted = totalTopicExecuted + topicExecuted;
                } else {
                    continue;
                }
                var lastNodeVisited = topic && topic['Last Node Visited'];
                var lastNodeReachedCount = lastNodeVisited && lastNodeVisited['true'] && parseInt(lastNodeVisited['true']);
                if (lastNodeReachedCount) {
                    totalTopicCompleted = totalTopicCompleted + lastNodeReachedCount;
                }
            }
            return totalTopicExecuted ? (totalTopicCompleted / totalTopicExecuted) : 0;
        }
        return 0;
    };

    var getTopicCompletedCount = function(response) {
        if (response) {
            var totalTopicCompleted = 0;
            for (var key in response) {
                var topic = response[key];
                var subCategory = topic && topic['Sub Category'];
                var lastNodeVisited = topic && topic['Last Node Visited'];
                var lastNodeReachedCount = lastNodeVisited && lastNodeVisited['true'] && parseInt(lastNodeVisited['true']);
                if (lastNodeReachedCount) {
                    totalTopicCompleted = totalTopicCompleted + lastNodeReachedCount;
                }
            }
            return totalTopicCompleted;
        }
        return 0;
    };

    var fromDate = input.from_date;
    var toDate = input.to_date;
    var requestBody = getRequestBody(fromDate, toDate);
    var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", requestBody);
    response = (response && response[requestBody.event_type_filter]) || {};
    var currentTopicCompletionRate = getTopicCompletionRate(response);
    var currentTopicCompletedCount = getTopicCompletedCount(response);
    var currentTopicCompletionPercentage = vaUtils.toPercentageDisplayValue(currentTopicCompletionRate);

    // Get previous stats
    var previousPeriod = vaUtils.getPreviousPeriod(fromDate, toDate);
    requestBody.from_date = previousPeriod.fromDate;
    requestBody.to_date = previousPeriod.toDate;
    response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", requestBody);
    response = (response && response[requestBody.event_type_filter]) || {};
    var previousTopicCompletionRate = getTopicCompletionRate(response);
    var previousTopicCompletedCount = getTopicCompletedCount(response);
   
	var changeInfo = '';
    var difference = Math.abs(currentTopicCompletedCount - previousTopicCompletedCount);
	if (difference > 0) {
		changeInfo = vaUtils.numFormatter(difference) + '';
		var completionRateDiff = Math.abs(currentTopicCompletionRate - previousTopicCompletionRate);
		if (previousTopicCompletionRate > 0 && completionRateDiff > 0) {
            var percentageChange = vaUtils.getDiffInPercentage(currentTopicCompletionRate, previousTopicCompletionRate);
            var symbol = percentageChange.includes('-') ? '' : '+';
            changeInfo += ' (' + symbol + percentageChange + ')';
        }
	}
	
    var output = {
        'topicCompletionRate': currentTopicCompletionPercentage,
        'changeInfo': changeInfo
    };
	
    CIAnalyticsLogger.getLogger('TopicFlowsCompletedRate').debugJson('Data broker result - {}', output);
	
    return output;
}
