(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var modelId = data.modelId;
        var removedIds = data.removedIds || [];
        var trainPercent = data.trainPercent;
        var result = new sn_nlu_workbench.TuneModel(modelId, removedIds, trainPercent).tuneModel();

        if (result.status === 'success') {
            response.setStatus(200);
        } else {
            response.setStatus(400);
        }
        response.setContentType('application/json');
        return result;
    } catch (e) {
        return new sn_ws_err.BadRequestError(e.message);
    }
})(request, response);
