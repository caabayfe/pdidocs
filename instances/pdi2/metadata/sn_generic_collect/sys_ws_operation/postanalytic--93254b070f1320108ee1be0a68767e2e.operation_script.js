(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var userAgent = request.getHeader("User-Agent");
    if (gs.nil(userAgent) || !userAgent.contains("SnMobile")) {
        response.setStatus(403);
        gs.warn("Request Received from UserAgent:" + userAgent);
        return;
    }
    var requestBody = request.body;
    var requestData = requestBody.data;
    var category = requestData.category;
    var instrumentationPoint = requestData.instrumentationPoint;
    var instrumentationEvent = requestData.instrumentationEvent;
    var gcfSampleMapString = requestData.gcfSampleMap;
    if (gs.nil(category))
        return new sn_ws_err.BadRequestError('Category cannot be empty');
    if (gs.nil(instrumentationPoint))
        return new sn_ws_err.BadRequestError('Instrumentation Point cannot be empty');
    if (gs.nil(instrumentationEvent))
        return new sn_ws_err.BadRequestError('Instrumentation Event cannot be empty');
    if (gs.nil(gcfSampleMapString))
        return new sn_ws_err.BadRequestError('Empty Sample Map');
    var gcfSampleMap;
    try {
        gcfSampleMap = JSON.parse(gcfSampleMapString);
    } catch (error) {
        return new sn_ws_err.BadRequestError('gcfSampleMap is not a valid json string');
    }
    var sm = new GCFSampleMap();
    for (var key in gcfSampleMap)
        sm.put('' + key, '' + gcfSampleMap[key]);
    GCFCollector.recordUsageEvent('' + category, '' + instrumentationPoint, '' + instrumentationEvent, sm);

})(request, response);
