(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var modelId = data.modelId;
        var entities = data.entities;
        var hasEntity = entities && entities.length > 0;
        if (modelId && hasEntity && NLUSystemUtil.canPerformEditOperations(modelId)) {
            response.setContentType('application/json');
            return new NLUImportUtil(modelId).importEntities(entities);
        } else {
            return new sn_ws_err.BadRequestError("No input data provided");
        }
    } catch (e) {
        return e;
    }
})(request, response);
