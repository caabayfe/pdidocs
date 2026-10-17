(function executeQuery(v_table, v_query) {
    try {
        var query = v_query.getEncodedQuery();
        var vaUtils = new sn_ci_analytics.VADashboardUtils();
        var decodedFilter = vaUtils.decodeFilter(query);
        var filter = decodedFilter.filter;
        var categoryList = filter.event_name_filter;
        var body = {
            from_date: decodedFilter.filter.from_date,
            to_date: decodedFilter.filter.to_date,
            platform: 'chat',
            event_type_filter: 'Integration Hub'
        };
        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date)) {
            CIAnalyticsLogger.getLogger('TopicSpokesCount').debug('Unable to load data due to missing/invalid parameter');
            return;
        }

        var categoryTopics;
        if (categoryList && categoryList.length > 0) {
            categoryTopics = vaUtils.getTopicByCategory(filter, categoryList);
        }
        var response = AnalyticsServiceInvoker.invoke('Event', 'getAnalyticsEventPropertyValues', body);
        response = response && response[body.event_type_filter];
        for (var spoke in response) {
            var data = response[spoke];
            var spokes = categoryTopics ? data && data['Topic Name'] : data && data['Spoke'];

            var count = spokes && Object.keys(spokes).reduce(function(prev, key) {
                if (categoryTopics) {
                    if (categoryTopics.indexOf(key) != -1) {
                        return prev + spokes[key];
                    } else {
                        return prev;
                    }
                } else {
                    return prev + spokes[key];
                }
            }, 0);
            var record = {
                sys_id: gs.generateGUID(),
                spoke: spoke,
                usage: count
            };
            CIAnalyticsLogger.getLogger('TopicSpokesCount').debugJson('Row data - {}', record);
            v_table.addRow(record);
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
})(v_table, v_query);
