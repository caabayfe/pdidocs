(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    return NLUStudioService.getEntitiesByModelId(request.pathParams.modelId);

})(request, response);
