(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var modelId = data.modelId;
        var intents = data.intents;
        var hasIntent = intents && intents.length > 0;
        if (modelId && hasIntent && NLUSystemUtil.canPerformEditOperations(modelId)) {
            response.setContentType('application/json');
            return new NLUImportUtil(modelId).importIntents(intents);
        } else {
            return new sn_ws_err.BadRequestError("No input data provided");
        }

    } catch (e) {
        return e;
    }
})(request, response);
