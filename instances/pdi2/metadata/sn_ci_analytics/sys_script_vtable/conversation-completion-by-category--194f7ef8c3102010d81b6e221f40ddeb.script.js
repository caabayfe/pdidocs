(function executeQuery(v_table, v_query) {
    var STANDARD = 'STANDARD';
    var getRequestBody = function(fromDate, toDate, eventType) {
        var requestBody = {};
        requestBody.from_date = fromDate;
        requestBody.to_date = toDate;
        requestBody.event_type_filter = eventType;
        return requestBody;
    };

    var getCount = function(topic) {
        var topicExecuted = 0;
        var lastNodeReachedCount = 0;
        var subCategory = topic && topic['Sub Category'];
        if (subCategory && subCategory[STANDARD]) {
            topicExecuted = topicExecuted + parseInt(subCategory[STANDARD]);
            var lastNodeVisited = topic && topic['Last Node Visited'];
            if (lastNodeVisited && lastNodeVisited['true']) {
                lastNodeReachedCount += parseInt(lastNodeVisited['true']);
            }
        }
        return {
            'complete': lastNodeReachedCount,
            'incomplete': topicExecuted - lastNodeReachedCount
        };
    };

    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    var query = v_query.getEncodedQuery();
    var decodedFilter = vaUtils.decodeFilter(query);
    var fromDate = decodedFilter.filter.from_date;
    var toDate = decodedFilter.filter.to_date;
    if (!vaUtils.isValidDate(fromDate) || !vaUtils.isValidDate(toDate)) {
        CIAnalyticsLogger.getLogger('ConversationCompletionByCategory').debug('Unable to load data due to missing/invalid parameter');
        return;
    }
    var EVENT_TYPE_TOPIC_CATEGORY = 'Topic Category';
    var EVENT_TYPE_TOPIC = 'Topic';
    var categoriesResponse = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", getRequestBody(fromDate, toDate, EVENT_TYPE_TOPIC_CATEGORY));
    var topicsResponse = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", getRequestBody(fromDate, toDate, EVENT_TYPE_TOPIC));
    categoriesResponse = categoriesResponse && categoriesResponse[EVENT_TYPE_TOPIC_CATEGORY];
    topicsResponse = topicsResponse && topicsResponse[EVENT_TYPE_TOPIC];
    if (categoriesResponse && topicsResponse) {
        for (var categoryKey in categoriesResponse) {
            var topics = categoriesResponse[categoryKey];
            var topicNames = topics && topics["Topic Name"];
            var totalIncomplete = 0;
            var totalComplete = 0;
            if (categoryKey && topicNames) {
                for (var topicKey in topicNames) {
                    if (topicsResponse.hasOwnProperty(topicKey)) {
                        var count = getCount(topicsResponse[topicKey]);
                        totalComplete = totalComplete + count['complete'];
                        totalIncomplete = totalIncomplete + count['incomplete'];
                    }
                }
            }
            var record = {
                sys_id: gs.generateGUID(),
                category: categoryKey,
                completed: totalComplete,
                not_completed: totalIncomplete
            };
            CIAnalyticsLogger.getLogger('ConversationCompletionByCategory').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    }
})(v_table, v_query);
