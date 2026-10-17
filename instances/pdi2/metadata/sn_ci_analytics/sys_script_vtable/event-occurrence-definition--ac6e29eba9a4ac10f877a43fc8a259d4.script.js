(function executeQuery(v_table, v_query) {
    var INTENT = 'Intent';
    try {
        var vaUtils = new VADashboardUtils();
        var decodedQuery = vaUtils.decodeFilter(v_query.getEncodedQuery());
        var filter = decodedQuery.filter;

        var body = {
            from_date: filter.from_date,
            to_date: filter.to_date,
            platform: filter.platform,
            event_type_filter: filter.event_type || 'Custom',
            date_bucket: filter.date_bucket,
        };

        if (body.event_type_filter !== INTENT) {
            body.event_name_filter = filter.event_name_filter;
        }

        if (filter.event_type === 'Topic Category')
            body.date_bucket = filter.date_bucket_topic_usage_trend;

        if (!vaUtils.isValidDate(body.from_date) || !vaUtils.isValidDate(body.to_date) || (!body.event_name_filter && body.event_type_filter !== INTENT) || !body.date_bucket) {
            CIAnalyticsLogger.getLogger('EventOccurrenceDefinition').debug('Unable to load data due to missing/invalid parameter');
            return;
        }
        var response = AnalyticsServiceInvoker.invoke('Event', 'getAnalyticsTotalEventsByDate', body);
        var eventDataByName = response[body.event_type_filter] || {};
        var props = ['Occurrences', 'Sessions'];

        if (eventDataByName) {
            for (var eventName in eventDataByName) {
                var eventDataByDate = eventDataByName[eventName] || {};
                eventDataByDate = vaUtils.addMissingDates(body.from_date, body.to_date, eventDataByDate, body.date_bucket, props);
                if (eventDataByDate) {
                    Object.keys(eventDataByDate).forEach(function(dateKey) {
                        var event = eventDataByDate[dateKey];
                        var gd = new GlideDateTime();
                        gd.setDisplayValue(dateKey, 'yyyy-MM-dd');
                        var record = {
                            sys_id: gs.generateGUID(),
                            event_name: eventName,
                            occurrences: event['Occurrences'],
                            sessions: event['Sessions'],
                            date: gd
                        };
                        CIAnalyticsLogger.getLogger('EventOccurrenceDefinition').debugJson('Row data - {}', record);
                        v_table.addRow(record);
                    });
                }
            }
        }

    } catch (ex) {
        var message = ex.message;
        gs.error(ex);
        gs.addErrorMessage(message);
    }

})(v_table, v_query);
