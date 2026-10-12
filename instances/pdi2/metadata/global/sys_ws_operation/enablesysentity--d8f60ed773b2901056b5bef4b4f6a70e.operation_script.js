(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data;
    try {
        var modelId = data.modelId;
        var sysEntity = data.sysEntity;
        if (modelId && sysEntity) {
            response.setContentType('application/json');
            return new NLUModel(modelId).enableSysEntity(sysEntity);
        } else {
            return new sn_ws_err.BadRequestError("Input is not valid");
        }

    } catch (e) {
        return e;
    }

})(request, response);
