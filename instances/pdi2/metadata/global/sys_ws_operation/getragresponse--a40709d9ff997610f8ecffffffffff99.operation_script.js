(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var start = new GlideDateTime();
    var logger = new sn_log.GlideLogger("global.rag_response_generator");
    var requestPayload = request.body.data;
    var ragPerfMetric = new global.RAGPerfMetrics(logger);

    ragPerfMetric.startSection('Validation');
    var isValid = validateReqPayload(requestPayload);
    ragPerfMetric.endSection('Validation');
    if (!isValid) return;

    var userUtterance = requestPayload.userUtterance;
    var searchProfileName = requestPayload.searchProfileName;
    var queryingUser = requestPayload.queryingUser || gs.getUserName();
    var caller = requestPayload.caller;
    var queryDetails = requestPayload.queryDetails;
    var locale = requestPayload.locale;
    var conversation = requestPayload.conversation;
    var callerContext = requestPayload.callerContext;
    var signalsContext = requestPayload.signalsContext;

    try {
        logger.debug('RAG Response API: Initiating search for user: {0}', queryingUser);
        logger.debug('RAG Response API: Request payload to retrieve RAG response: {0}', JSON.stringify(requestPayload));

        var ragRespGenerator = new global.RAGResponseGenerator(userUtterance, searchProfileName, caller, locale, conversation, callerContext, signalsContext, ragPerfMetric);
        var ragResponse = ragRespGenerator.retrieveResults(queryDetails);

        var responseBody = {};
        responseBody.userUtterance = userUtterance;
        responseBody.ragResponse = ragResponse.results;
        responseBody.signalsCorrelationData = ragResponse.signalsCorrelationData;
        response.setBody(responseBody);
        logger.debug("RAG Response : {0}", JSON.stringify(ragResponse));
    } catch (ex) {
        response.setError(new sn_ws_err.BadRequestError('Exception occurred while retrieving RAG Response: ' + ex));
        logger.error("Exception occurred while retrieving RAG Response: {0}", ex);
    } finally {
        var end = new GlideDateTime();
        var duration = GlideDateTime.subtract(start, end);
        duration = duration.getByFormat("HH:mm:ss.SSS");
        logger.debug("RAG Response API: StartTime : " + start + ", Endtime : " + end + " and Duration for response received : " + duration);

        logger.debug("Perf Breakdown : " + JSON.stringify(ragPerfMetric.summary(), null, 2));
    }
})(request, response);


function validateReqPayload(requestPayload) {
    if (gs.nil(requestPayload)) {
        response.setError(new sn_ws_err.BadRequestError('Request Payload is empty.'));
        return false;
    }

    var userUtterance = requestPayload.userUtterance;
    if (gs.nil(userUtterance)) {
        response.setError(new sn_ws_err.BadRequestError('Missing mandatory parameter: userUtterance'));
        return false;
    }

    var searchProfileName = requestPayload.searchProfileName;
    if (gs.nil(searchProfileName)) {
        response.setError(new sn_ws_err.BadRequestError('Missing mandatory parameter: searchProfileName'));
        return false;
    }

    var conversation = requestPayload.conversation;
    if (gs.nil(conversation) || conversation == undefined) {
        response.setError(new sn_ws_err.BadRequestError('Missing mandatory parameter: conversation'));
        return false;
    }

    return true;
}
