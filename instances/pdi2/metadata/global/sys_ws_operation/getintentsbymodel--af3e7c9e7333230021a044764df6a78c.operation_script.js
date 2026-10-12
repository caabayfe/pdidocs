(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    return NLUStudioService.getIntentsByModelId(request.pathParams.modelId);

})(request, response);
