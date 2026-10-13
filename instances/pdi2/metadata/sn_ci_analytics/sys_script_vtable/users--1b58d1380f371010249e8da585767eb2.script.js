(function executeQuery(v_table, v_query) {
    var STAR_OUTLINE_CHAR = "☆";
    var STAR_FILL_CHAR = "★";
    var ANONYMOUS = gs.getMessage("Anonymous");
    var fieldMapper = {
        "user_index": "UserAppIndex",
        "first_conversation": "UserFirstSessionTime",
        "last_conversation": "UserLastSessionTime",
        "time_on_chat": "UserTotalDuration",
        "last_used_channel": "", //"ChannelName",
        "last_used_language": "", //"Locales",
        "favorite": "" //"IsFavorite"
    };
    var utils = new sn_ci_analytics.VADashboardUtils();

    function getLastClient(clients) {
        var client = {};
        var sessionTime = null;
        clients.forEach(function(currentClient) {
            if (currentClient) {
                var lastSessionTime = utils.safelyGet(currentClient, ['LastSessionTime', '$date'], 0);
                if (!sessionTime || sessionTime < lastSessionTime) {
                    sessionTime = lastSessionTime;
                    client = currentClient;
                }
            }
        });
        return client;
    }

    function _fetchRequest(pageNum, pageSize, sortField, sortDirection, vaUtils, parsedQuery) {
        var body = {
            "page_size": pageSize,
            "page_num": pageNum,
            "sort_direction": sortDirection,
            "sort_field": sortField,
            "query": parsedQuery.query ? JSON.stringify(parsedQuery.query) : filter.query
        };
        var result = [];
        var response = AnalyticsServiceInvoker.invoke("User", "findPage", body);
        var parsedContent = response && response.Hits || [];
        parsedContent.forEach(function(record) {
            var parsedItem = JSON.parse(record) || {};
            var firstConversation = vaUtils.getUtcDateTime(vaUtils.safelyGet(parsedItem, ['FirstSessionTime', '$date'], null));
            var lastConversation = vaUtils.getUtcDateTime(vaUtils.safelyGet(parsedItem, ['LastSessionTime', '$date'], null));
            var totalDuration = new GlideDuration(parsedItem.TotalDuration || 0);
            var clients = parsedItem.Clients || [];
            var lastClient = getLastClient(clients);
            var languages = lastClient.Languages || [];
            var isFavorite = parsedItem.IsFavorite ? STAR_FILL_CHAR : STAR_OUTLINE_CHAR;
            var mappedRecord = {
                favorite: isFavorite,
                first_conversation: firstConversation,
                last_conversation: lastConversation,
                last_used_channel: lastClient.ChannelName || "",
                last_used_language: languages && languages.length ? languages[languages.length - 1] : "",
                time_on_chat: totalDuration,
                user_name: utils.getUserName(parsedItem.AppUserId) || ANONYMOUS,
                hashed_user_id: parsedItem.AppUserId || ANONYMOUS,
                user_index: parsedItem.UserAppIndex || 0,
                sys_id: parsedItem._id.$oid,
            };
            CIAnalyticsLogger.getLogger('Users').debugJson('Row data - {}', mappedRecord);
            result.push(mappedRecord);
        });
        return result;
    }

    try {
        var query = v_query.getEncodedQuery();
        if (!query)
            return;

        var decodedQuery = utils.decodeFilter(query);
        var filter = decodedQuery.filter;

        if (filter.query) {
            var parsedQuery = JSON.parse(filter.query);
            // Temorary check for comparisonModel array because we are keeping appsee
            // query builder active too for QE.
            if (Array.isArray(parsedQuery)) {
                var vaConditionBuilderUtil = new sn_ci_analytics.VAConditionBuilderUtil();
                parsedQuery = vaConditionBuilderUtil.convertToAppseeUsers(parsedQuery);
            }
            var result = [],
                paginatedResult = [];
            var sortField = fieldMapper[decodedQuery.sort_field] || 'UserAppIndex';
            var sortDirection = fieldMapper[decodedQuery.sort_field] ? decodedQuery.sort_direction : 2;
            var vaUtils = new sn_ci_analytics.VADashboardUtils();
            var isExportRequest = filter.page_size !== v_query.getLastRowWanted();
            if (isExportRequest) {
                // paginate total pagesize by chunk size (100 default)
                // maxRequestSize (max no. of records to be queries)
                // minimum of $impex_properties (based on format) and remote table records limit
                var maxRequestSize = Math.min(v_query.getLastRowWanted(), vaUtils.V_TABLE_MAX_ROWS, vaUtils.DASHBOARD_EXPORT_LIMIT);
                var chunkPageSize = vaUtils.V_TABLE_MAX_PAGE_CHUNK_SIZE, pageNum = vaUtils.V_TABLE_START_PAGE;
                var maxTrials = Math.ceil(maxRequestSize / chunkPageSize), trial = 1;
                paginatedResult = _fetchRequest(pageNum, chunkPageSize, sortField, sortDirection, vaUtils, parsedQuery);
                result = paginatedResult;
                while (paginatedResult.length > 0 && trial < maxTrials) {
                    pageNum++;
                    trial++;
                    paginatedResult = _fetchRequest(pageNum, chunkPageSize, sortField, sortDirection, vaUtils, parsedQuery);
                    result = result.concat(paginatedResult);
                }
            } else
                //straight forward request
                result = _fetchRequest(filter.page_num, filter.page_size, sortField, sortDirection, vaUtils, parsedQuery);

            //add to v_table
            result.forEach(function(eachResult) {
                v_table.addRow(eachResult);
            });
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }

})(v_table, v_query);
