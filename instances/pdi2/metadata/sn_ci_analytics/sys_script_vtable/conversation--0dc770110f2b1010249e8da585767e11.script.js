(function executeQuery(v_table, v_query) {
    var STAR_OUTLINE_CHAR = "☆";
    var STAR_FILL_CHAR = "★";
    var ANONYMOUS = gs.getMessage("Anonymous");

    function getEndState(conversation) {
        if (conversation.EndState)
            return conversation.EndState;

        if (!conversation.EndState && conversation.ConversationType === 'Never Engaged') {
            return 'Notification Sent, Never Engaged'; // DEF0188367
        }
    }

    function _fetchRequest(query, vaUtils, pageSize, pageNum) {
        var result = [];
        var requestQueries = vaUtils.getConversationFilterQuery(query, pageSize, pageNum);
        if (requestQueries) {
            var response = AnalyticsServiceInvoker.invoke("Session", "findPage", requestQueries.filterQuery);
            var parsedContent = response && response.Hits || [];
            parsedContent.forEach(function(record) {
                var parsedItem = JSON.parse(record) || {};
                var isFavorite = parsedItem.IsFavorite ? STAR_FILL_CHAR : STAR_OUTLINE_CHAR;
                var mappedRecord = {
                    date: vaUtils.getUtcDateTime(vaUtils.safelyGet(parsedItem, ['StartTime', '$date'], null)),
                    duration: new GlideDuration(parsedItem.Duration || 0),
                    user_index: parsedItem.UserAppIndex || 0,
                    hashed_user_id: parsedItem.AppUserId || ANONYMOUS,
                    sys_id: parsedItem._id && parsedItem._id.$oid || gs.generateGUID(),
                    channel: parsedItem.ChannelName || "",
                    language: parsedItem.Language || "",
                    topics: parsedItem.ScreenCount || 0,
                    end_state: getEndState(parsedItem),
                    favorite: isFavorite
                };
                CIAnalyticsLogger.getLogger('Conversation').debugJson('Row data - {}', mappedRecord);
                result.push(mappedRecord);
            });
        }
        return result;
    }

    try {
        var query = v_query.getEncodedQuery();
        var result = [],
            paginatedResult = [];
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedQuery = vaUtils.decodeFilter(query);
        var filter = decodedQuery.filter;
        var isExportRequest = filter.page_size !== v_query.getLastRowWanted();
        if (isExportRequest) {
            var pageNum = vaUtils.V_TABLE_START_PAGE;
            // maxRequestSize (max no. of records to be queries)
            // minimum of $impex_properties (based on format) and remote table records limit
            var maxRequestSize = Math.min(v_query.getLastRowWanted(), vaUtils.V_TABLE_MAX_ROWS, vaUtils.DASHBOARD_EXPORT_LIMIT);
            var chunkPageSize = vaUtils.V_TABLE_MAX_PAGE_CHUNK_SIZE;
            var maxTrials = Math.ceil(maxRequestSize / chunkPageSize), trial = 1;
            paginatedResult = _fetchRequest(query, vaUtils, chunkPageSize, pageNum);
            result = paginatedResult;
            while (paginatedResult.length > 0 && trial < maxTrials) {
                pageNum++;
                trial++;
                paginatedResult = _fetchRequest(query, vaUtils, chunkPageSize, pageNum);
                result = result.concat(paginatedResult);

            }
        } else {
            result = _fetchRequest(query, vaUtils, null, null);
        }
        result.forEach(function(eachResult) {
            v_table.addRow(eachResult);
        });
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
