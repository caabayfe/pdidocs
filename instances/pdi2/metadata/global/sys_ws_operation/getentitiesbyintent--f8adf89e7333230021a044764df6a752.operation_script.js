(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    return NLUStudioService.getEntitiesByIntentId(request.pathParams.intentId);

})(request, response);
