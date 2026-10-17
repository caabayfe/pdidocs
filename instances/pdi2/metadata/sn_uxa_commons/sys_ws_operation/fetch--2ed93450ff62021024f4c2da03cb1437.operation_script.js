(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const uxaPageFilterProcessor = new sn_uxa_commons.UXAPageFilterProcessor();

    try {
        // get the params from the request URL and execute the function.
        const {
            channel,
            appSysId,
            componentId,
            dynamicTimeRange
        } = request.queryParams;
        const record = uxaPageFilterProcessor.getFiltersForUser(channel[0], appSysId[0], componentId[0], dynamicTimeRange?.[0]);
        response.setStatus(200);
        response.setBody(record);
    } catch (ex) {
        // incase of any failures on getting the filters, just return the default date filter.
        gs.error('Error getting page filters reverting to default date filter' + ex);
        gs.error(ex.stack);
        response.setStatus(200);
        response.setBody(uxaPageFilterProcessor.getDefaultDateFilter());
    }
})(request, response);
