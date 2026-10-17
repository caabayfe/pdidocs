function transform(input) {
    var response = {};
    if (input.type && input.property) {
        var requestBody = {
            platform: input.platform,
            event_type: input.type,
            event_property_name: input.property,
        };
        response = AnalyticsServiceInvoker.invoke('Event', 'getEventNamesByEventPropertyValues', requestBody);
        if (input.propertyFilter) { //property filter is optional, if it is not given we return all events under given property
            response = response && response[input.propertyFilter];
            response.sort(function(a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
        }
    }
    CIAnalyticsLogger.getLogger('FetchEventNamesByProperty').debugJson('Data broker result - {}', response);
    return response;
}
