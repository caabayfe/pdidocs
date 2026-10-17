(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var data = request.body.data,
        result;
    try {

        if (data.modelId || data.type) {

            if (data.type) {
                result = NLUStudioValidator.validateRecord(data);
            } else {
                result = NLUStudioValidator.validate(data.modelId, data.intentId, data.utterance, data.entityId);
            }

            if (result.status === 'success') {
                response.setStatus(200);
            } else {
                response.setStatus(400);
            }

            response.setContentType('application/json');
            return result;
        } else {
            return new sn_ws_err.BadRequestError("No input data provided");
        }

    } catch (e) {
        return e;
    }

})(request, response);
