(function executeQuery(v_table, v_query) {
    var STANDARD = "STANDARD",
        SUB_CATEGORY = "Sub Category",
        TOPIC_BLOCK = "TOPIC_BLOCK",
        LIVE_AGENT_TRANSFER = "Live Agent Transfer",
        LAST_NODE_VISITED = "Last Node Visited",
        PARENT_TOPIC_NAME = "Parent Topic Name",
        topicId = {};

    function getSum(total, num) {
        return total + Number(num) * topicId[num];
    }

    function getCount(total, num) {
        return total + topicId[num];
    }

    function getFormattedValue(a, b) {
        if (b === 0) return (0).toFixed(2);

        return (a * 100 / b).toFixed(2);
    }

    function insertTopicBlocks(response) {
        for (var key in response) {
            var topicData = response[key];
            var subCategory = topicData[SUB_CATEGORY];
            if (subCategory && subCategory[TOPIC_BLOCK]) {
                var totalTopicsCount = subCategory[TOPIC_BLOCK] || 0;
                var topicBlockRecord = {
                    "topic_block": key,
                    "executed_count": totalTopicsCount || 0,
                    "type": "Topic_Block",
                    "sys_id": gs.generateGUID()
                };
                CIAnalyticsLogger.getLogger('TopicExecutionStats').debugJson('Row data - {}', topicBlockRecord);
                v_table.addRow(topicBlockRecord);
            }
        }
    }

    function insertTopics(response) {
        var totalTopicCount = 0;

        for (var key in response) {
            if (response[key][SUB_CATEGORY] && response[key][SUB_CATEGORY][STANDARD]) {
                topicId = (response[key]["Topic Id"] || {});
                totalTopicCount += Object.keys(topicId).reduce(getCount, 0);
            }
        }

        for (key in response) {
            var topicData = response[key];
            var subCategory = topicData[SUB_CATEGORY];
            if (subCategory && subCategory[STANDARD]) {
                topicId = topicData["Topic Id"] || {};
                var totalCount = Object.keys(topicId).reduce(getCount, 0);

                var transferredToLA = (topicData[LIVE_AGENT_TRANSFER] || {})["true"] || 0;
                var notTransferredToLA = (topicData[LIVE_AGENT_TRANSFER] || {})["false"] || 0;
                var totalLACount = transferredToLA + notTransferredToLA;

                var lastNodeVisited = (topicData[LAST_NODE_VISITED] || {})["true"] || 0;
                var lastNodeNotVisited = (topicData[LAST_NODE_VISITED] || {})["false"] || 0;
                var totalLastNodeCount = lastNodeVisited + lastNodeNotVisited;

                var nluIntent = topicData["NLU Intent"] || {};
                var correctIntents = nluIntent["Correct"] || 0;
                var inCorrectIntents = nluIntent["Incorrect"] || 0;
                var autoSelectIntents = nluIntent["Auto-Select"] || 0;
                var totalIntents = correctIntents + inCorrectIntents + autoSelectIntents;

                var mappedRecord = {
                    "topic": key,
                    "correct_nlu_prediction": getFormattedValue(correctIntents, totalIntents),
                    "initiated": getFormattedValue(totalCount, totalTopicCount),
                    "transfer_to_live_agent": getFormattedValue(transferredToLA, totalLACount),
                    "incomplete": getFormattedValue(lastNodeNotVisited, totalLastNodeCount),
                    "type": "Topic",
                    "sys_id": gs.generateGUID()
                };
                CIAnalyticsLogger.getLogger('TopicExecutionStats').debugJson('Row data - {}', mappedRecord);
                v_table.addRow(mappedRecord);
            }
        }
    }

    function insertParentTopics(topicBlockData) {
        if (topicBlockData) {
            var subCategory = topicBlockData[SUB_CATEGORY];
            var totalTopicsCount = subCategory[TOPIC_BLOCK] || 0;
            var parentTopics = topicBlockData[PARENT_TOPIC_NAME] || {};
            for (var topic in parentTopics) {
                var record = {
                    "topic": topic,
                    "executed_count": parentTopics[topic],
                    "type": "Topic",
                    "sys_id": gs.generateGUID()
                };
                CIAnalyticsLogger.getLogger('TopicExecutionStats').debugJson('Row data - {}', record);
                v_table.addRow(record);
            }
        }
    }

    function filterTopics(categoryTopics, response) {
        var topics = {};
        categoryTopics.forEach(function(topic) {
            topics[topic] = response[topic];
        });
        return topics;
    }

    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedQuery = vaUtils.decodeFilter(query);
        var filter = decodedQuery.filter;
        var categoryList = filter.category;
		categoryList = Array.isArray(categoryList) ? categoryList : [];
        var topicBlock = filter.topic_block;
        var sub_category = filter.sub_category || "";
        var body = {
            "from_date": filter.from_date,
            "to_date": filter.to_date,
            "event_type_filter": "Topic",
        };
        if (vaUtils.isValidDate(body.from_date) && vaUtils.isValidDate(body.to_date) && sub_category) {
            var categoryTopics;
            if (categoryList && categoryList.length > 0) {
                categoryTopics = vaUtils.getTopicByCategory(filter, categoryList);
            }
            var response = AnalyticsServiceInvoker.invoke("Event", "getAnalyticsEventPropertyValues", body);
            response = response && response[body.event_type_filter];
            var topics = categoryTopics ? filterTopics(categoryTopics, response) : response;
            if (sub_category === STANDARD)
                insertTopics(topics);
            else if (sub_category === TOPIC_BLOCK) {
                if (topicBlock) insertParentTopics(response[topicBlock]);
                else insertTopicBlocks(topics);
            }
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }

})(v_table, v_query);
