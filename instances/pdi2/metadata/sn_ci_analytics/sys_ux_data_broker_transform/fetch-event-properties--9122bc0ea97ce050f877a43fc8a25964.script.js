function transform(input) {
    var requestBody = {
        platform: input.platform || '',
        from_date: input.startDate,
        to_date: input.endDate,
        event_name_filter: input.eventName,
        event_type_filter: input.eventType
    };
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    if (!vaUtils.isValidDate(requestBody.from_date) || !vaUtils.isValidDate(requestBody.to_date) || !requestBody.event_type_filter || !requestBody.event_name_filter) {
        return {};
    }
    var response = AnalyticsServiceInvoker.invoke('Event', 'getAnalyticsEventPropertyValues', requestBody);
    var result = {
        eventProperties: response[input.eventType],
        startDate: input.startDate,
        endDate: input.endDate
    };
    CIAnalyticsLogger.getLogger('FetchEventProperties').debugJson('Data broker result - {}', result);
    return result;
}
