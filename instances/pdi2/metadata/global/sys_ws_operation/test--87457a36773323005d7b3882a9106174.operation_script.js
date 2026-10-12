(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.body.data;
    try {

        if (data.modelId && data.utterance) {
            var result = NLUStudioPredictor.testUtterance(data.modelId, data.utterance);

            if (result.status === 'success') {
                response.setStatus(200);
            } else {
                response.setStatus(400);
            }

            response.setContentType('application/json');
            return result;

        } else {
            return new sn_ws_err.BadRequestError("Invalid input data provided");
        }

    } catch (e) {
        return e;
    }

})(request, response);
