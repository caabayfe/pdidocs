var AutoResolutionAPIHelper = Class.create();

AutoResolutionAPIHelper.HR_AVG_CASE_COST_PROPERTY = "sn_iar_hr.avg_case_cost";
AutoResolutionAPIHelper.HR_AVG_RESOLUTION_TIME_PROPERTY = "sn_iar_hr.avg_agent_resolution_time";
/**
 * Validate the passed inputs
 * @param tableName
 * @param numOfDays
 * @returns {boolean}
 */
AutoResolutionAPIHelper.validateInputs = function (tableName, numOfDays) {
    if (gs.nil(tableName) ||
        !AutoResolutionAPIHelper.validateTaskTable(tableName) ||
        gs.nil(AutoResolutionUtil.getConfigurationForTask(tableName)))
        return false;

    if (gs.nil(numOfDays) || !isNaN(numOfDays) <= 0)
        return false;

    return true;
};

AutoResolutionAPIHelper.validateTaskTable = function(tableName) {
    var list = GlideDBObjectManager.get().getTableExtensions("task");
    return (list.indexOf(tableName) >= 0);
};

/**
 * Returns Number of context records processed for the given task table and duration
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getCasesProcessedCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns number of IAR context records that are in *processed* state for the given task table and duration
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getDeflectableCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("task_processing_state", AutoResolutionConstants.TASK_PROCESSING_STATE.PROCESSED);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns number of IAR context records that are in processed state and notification state is accepted for the given
 * task table and duration
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getReviewedCaseCount = function (tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("task_processing_state", AutoResolutionConstants.TASK_PROCESSING_STATE.PROCESSED);
    ga.addQuery("notification_state", "accepted");
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
}

/**
 * Returns number of context records that have task_resolved=true for the given task table and duration
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getResolvedCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("task_resolved", true);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns the number of unique topics that were picked as a matched topic for the intents
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getUniqueTopicsCount = function(tableName, days) {
    var topicsCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("intent_topic_state", AutoResolutionConstants.INTENT_TOPIC_STATE.FOUND_MATCHED_TOPIC);
    ga.addNotNullQuery("matched_topic");
    ga.groupBy("matched_topic");
    ga.query();
    while (ga.next())
        topicsCount++;
    return topicsCount;
};

/**
 * Returns the number of context records that has a matched intent and a corresponding matched topic
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getMatchedIntentsCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addNotNullQuery("nlu_intent");
    ga.addQuery("intent_topic_state", AutoResolutionConstants.INTENT_TOPIC_STATE.FOUND_MATCHED_TOPIC);
    ga.addQuery("task_processing_state", AutoResolutionConstants.TASK_PROCESSING_STATE.PROCESSED);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns the number of context records that has no matched intent but a corresponding topic (AI Search Display topic)
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getAISearchResultsCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("intent_topic_state", AutoResolutionConstants.INTENT_TOPIC_STATE.NO_INTENT);
    ga.addNotNullQuery("matched_topic");
    ga.addQuery("task_processing_state", AutoResolutionConstants.TASK_PROCESSING_STATE.PROCESSED);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns the number of context records that has an intent but no matched topic
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getMatchedIntentsWithNoTopicsCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addNotNullQuery("nlu_intent");
    ga.addQuery("intent_topic_state", AutoResolutionConstants.INTENT_TOPIC_STATE.NO_MATCHED_TOPIC);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns the number of context records which has a matched topic but notification couldn't be delivered
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getMatchedTopicsWithNotificationsNotDeliveredCaseCount = function(tableName, days) {
    var caseCount = 0;
    var ga = initializeContextGA(tableName, days);
    ga.addQuery("intent_topic_state", AutoResolutionConstants.INTENT_TOPIC_STATE.FOUND_MATCHED_TOPIC);
    ga.addNotNullQuery("matched_topic");
    ga.addQuery("task_processing_state", AutoResolutionConstants.TASK_PROCESSING_STATE.NOTIFICATION);
    ga.addAggregate("COUNT");
    ga.query();
    if (ga.next())
        caseCount = ga.getAggregate("COUNT");
    return caseCount;
};

/**
 * Returns a json with the count for each feedback type for AI Search results
 * @param {string} tableName
 * @param {number} days
 * @returns {{}}
 */
AutoResolutionAPIHelper.getFeedbackCountForCases = function(tableName, days) {
    var results = {};
    results.positive = 0;
    results.negative = 0;
    results.no_feedback = 0;

    var feedbackCount = 0;

    var ga = new GlideAggregate(AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME);
    ga.addNotNullQuery("ar_context");
    ga.addQuery("task_table", tableName);
    ga.addQuery("sys_created_on", ">=", getDateTime(days));
    ga.groupBy("feedback_type");
    ga.addAggregate("COUNT");
    ga.query();
    while (ga.next()) {
        feedbackCount = ga.getAggregate("COUNT");
        var feedbackType = ga.getValue("feedback_type");
        // nil/empty feedback is considered as no_feedback
        if (gs.nil(feedbackType))
            results.no_feedback = feedbackCount;
        else if (feedbackType === "helpful")
            results.positive = feedbackCount;
        else if(feedbackType === "not_helpful")
            results.negative = feedbackCount;
    }
    return results;
};

/**
 * Returns a json with the count for notification delivered on each response channel
 * @param {string} tableName
 * @param {number} days
 * @returns {{}}
 */
AutoResolutionAPIHelper.getNotificationsDeliveredCountForCases = function(tableName, days) {
    var results = {};
    var emailCount = 0;
    var smsCount = 0;
    var vaCount = 0;

    var ga = initializeContextGA(tableName, days);
    ga.addNotNullQuery("response_channels");
    ga.groupBy("response_channels");
    ga.query();
    while (ga.next()) {
        var responseChannels = ga.getValue("response_channels");
        var respChannelList = responseChannels.split(",");
        for (var i = 0; i < respChannelList.length; i++) {
            switch (respChannelList[i]) {
                case AutoResolutionNotificationHelper.RESPONSE_CHANNEL["EMAIL"]:
                    emailCount++;
                    break;

                case AutoResolutionNotificationHelper.RESPONSE_CHANNEL["SMS"]:
                    smsCount++;
                    break;

                case AutoResolutionNotificationHelper.RESPONSE_CHANNEL["VA"]:
                    vaCount++;
                    break;

                default:
                    gs.warn("Unsupported response channel for IAR");
                    break;
            }
        }
    }
    results[AutoResolutionNotificationHelper.RESPONSE_CHANNEL["EMAIL"]] = emailCount;
    results[AutoResolutionNotificationHelper.RESPONSE_CHANNEL["SMS"]] = smsCount;
    results[AutoResolutionNotificationHelper.RESPONSE_CHANNEL["VA"]] = vaCount;
    return results;
};

/**
 * Returns the total number of hours saved by IAR by multiplying the mean time to resolution (retrieved by the system property)
 * with the number of cases processed by IAR
 * @param {string}tableName
 * @param {number}days
 * @returns {number}
 */
AutoResolutionAPIHelper.getHoursSaved = function(tableName, days) {
    try {
        var avgResolutionTime = Number(gs.getProperty(AutoResolutionAPIHelper.HR_AVG_RESOLUTION_TIME_PROPERTY, 8));
        var casesProcessedCount = AutoResolutionAPIHelper.getResolvedCaseCount(tableName, days);

        return avgResolutionTime * casesProcessedCount;
    } catch (ex) {
        gs.warn("Unexpected exception while computing hours saved for IAR: " + ex);
        return 0;
    }
};

/**
 * Returns the total cost saved by multiplying the hours saved and avg case cost retrieved by a system property
 * @param {string} tableName
 * @param {number} days
 * @returns {number}
 */
AutoResolutionAPIHelper.getCostSaved = function(tableName, days) {
    var hoursSaved = AutoResolutionAPIHelper.getHoursSaved(tableName, days);
    var avgCost = Number(gs.getProperty(AutoResolutionAPIHelper.HR_AVG_CASE_COST_PROPERTY, 15));

    try {
        return hoursSaved * avgCost;
    } catch (ex) {
        gs.warn("Unexpected exception while computing cost saved for IAR: " + ex);
        return 0;
    }

};

/**
 * 
 * @param configSysId
 * @returns {*[]}
 */
AutoResolutionAPIHelper.getActiveResponseChannelsByConfiguration = function(configSysId) {
    var activeResponseChannels = [];
    var responseChannelGr = new GlideRecord(AutoResolutionConstants.RESPONSE_CHANNEL_TABLE_NAME);
    responseChannelGr.addQuery("configuration", configSysId);
    responseChannelGr.addActiveQuery();
    responseChannelGr.query();

    while (responseChannelGr.next())
        activeResponseChannels.push(responseChannelGr.getValue("response_channel"));

    return activeResponseChannels;
};

/**
 *
 * @param {string}tableName
 * @param {number}days
 * @returns {GlideAggregate}
 */
function initializeContextGA(tableName, days) {
    var ga = new GlideAggregate(AutoResolutionConstants.CONTEXT_TABLE_NAME);
    ga.addQuery("sys_class_name", AutoResolutionConstants.CONTEXT_TABLE_NAME);
    ga.addNotNullQuery("task"); // in case the task gets deleted by mistake
    ga.addQuery("task.sys_class_name", tableName);
    ga.addQuery("sys_created_on", ">=", getDateTime(days));
    return ga;
}

/**
 * Construct the date time for the number of days passed
 * @param {number} numOfDays
 * @returns {GlideDateTime}
 */
function getDateTime(numOfDays) {
    var gdt = new GlideDateTime();
    gdt.addDaysUTC(-numOfDays);
    return gdt;
}
