function transform(input) {
    var eventNames = {};
    if (input.type) {
        var requestBody = {
            platform: input.platform,
            event_type_filter: input.type
        };
        eventNames = AnalyticsServiceInvoker.invoke('Event', 'getEventNamesByType', requestBody);
        eventNames = eventNames && eventNames[requestBody.event_type_filter];
        var obbEvents = Object.keys(CAConstants.eventNames).map(function(k) {
            return CAConstants.eventNames[k];
        });
        eventNames = eventNames.filter(function(e) {
            return obbEvents.indexOf(e) == -1;
        });
        eventNames.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }
    CIAnalyticsLogger.getLogger('FetchEventNamesByType').debugJson('Data broker result - {}', eventNames);
    return eventNames;
}
