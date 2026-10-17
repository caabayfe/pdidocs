function transform(input) {
    var fieldMapper = {
        "user_index": "UserAppIndex",
        "first_conversation": "UserFirstSessionTime",
        "last_conversation": "UserLastSessionTime",
        "time_on_chat": "UserTotalDuration",
        "last_used_channel": "", //"ChannelName",
        "last_used_language": "", //"Locales",
        "favorite": "" //"IsFavorite"
    };

    try {
        var result = {};
        var query = input.query;
        var utils = new sn_ci_analytics.VADashboardUtils();

        var decodedFilter = utils.decodeFilter(query);
        var filter = decodedFilter.filter;
        if (filter.query) {
            var parsedQuery = JSON.parse(filter.query);
            // Temorary check for comparisonModel array because we are keeping appsee
            // query builder active too for QE.
            if (Array.isArray(parsedQuery)) {
                var vaConditionBuilderUtil = new sn_ci_analytics.VAConditionBuilderUtil();
                parsedQuery = vaConditionBuilderUtil.convertToAppseeUsers(parsedQuery);
            }

            var sortField = fieldMapper[decodedFilter.sort_field] || 'UserAppIndex';
            var sortDirection = fieldMapper[decodedFilter.sort_field] ? decodedFilter.sort_direction : 2;
            var body = {
                "page_size": filter.page_size,
                "page_num": filter.page_num,
                "sort_direction": sortDirection,
                "sort_field": sortField,
                "query": parsedQuery.query ? JSON.stringify(parsedQuery.query) : filter.query
            };

            var response = AnalyticsServiceInvoker.invoke("User", "getCount", body);
            body.query = "{}";
            var emptyResponse = AnalyticsServiceInvoker.invoke("User", "getCount", body);
            var count = response && response.Count || null;
            result = {
                totalCount: emptyResponse.Count || null,
                currentCount: response.Count || null,
                currentCountFormatted: response.Count ? utils.numFormatter(response.Count) : null,
                percentage: (emptyResponse.Count && response.Count) ? (response.Count / emptyResponse.Count) : null
            };
        }
        CIAnalyticsLogger.getLogger('UsersCount').debugJson('Data broker result - {}', result);

        return result;

    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
}
