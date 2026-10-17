(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var modelId = request.pathParams.modelId;
    response.setContentType('application/json');
    if (!modelId) {
        response.setStatus(400);
        response.setBody({
            errorMessage: 'No input model id provided'
        });
        return;
    }
    try {
        var results = VaNLU.validate(modelId);
        response.setBody(results);
    } catch (e) {
        response.setStatus(500);
        response.setBody({
            errorMessage: e.message
        });
    }

})(request, response);
