(function executeQuery(v_table, v_query) {

    function filterTopics(categoryTopics, response) {
        var topics = {};
        categoryTopics.forEach(function(topic) {
            topics[topic] = response[topic];
        });
        return topics;
    }

    var STANDARD = 'STANDARD';
    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var filter = decodedFilter.filter;
        var categoryList = filter.category;
        categoryList = Array.isArray(categoryList) ? categoryList : []
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date,
            event_type_filter: "Topic"
        };
        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date)) {
            CIAnalyticsLogger.getLogger('TopicsOccurrence').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var getFirstValue = function(data) {
            for (var i in data) return data[i];
        };
        var categoryTopics;
        if (categoryList && categoryList.length > 0) {
            categoryTopics = vaUtils.getTopicByCategory(filter, categoryList);
        }
        CIAnalyticsLogger.getLogger('TopicsOccurrence').debugJson('Topics data - {}', JSON.stringify(topics));
        var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
        response = response && response[body.event_type_filter];
        var topics = categoryTopics ? filterTopics(categoryTopics, response) : response;
        for (var topic in topics) {
            var topicData = response[topic];
            var subCategory = topicData && topicData['Sub Category'];
            if (subCategory && subCategory[STANDARD]) {
                var topicId = topicData['Topic Id'];
                var occurrenceCount = topicId && getFirstValue(topicId);
                var lastNodeVisited = topicData['Last Node Visited'];
                var liveAgentTransfer = topicData['Live Agent Transfer'];
                var completedCount = lastNodeVisited && lastNodeVisited['true'];
                var notCompletedCount = lastNodeVisited && lastNodeVisited['false'];
                var liveAgentTransferCount = liveAgentTransfer && liveAgentTransfer['true'];
                var record = {
                    sys_id: gs.generateGUID(),
                    topic_name: topic,
                    occurrence: occurrenceCount,
                    completed: completedCount,
                    not_completed: notCompletedCount,
                    live_agent_transferred: liveAgentTransferCount
                };
                CIAnalyticsLogger.getLogger('TopicsOccurrence').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
