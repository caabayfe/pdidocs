(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var data = request.pathParams;

    try {

        if (data.modelId) {
            var result = NLUStudioService.getModelStatus(data.modelId);

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
