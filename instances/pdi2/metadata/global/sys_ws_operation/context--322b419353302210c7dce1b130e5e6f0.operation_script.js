(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var exp_param_name = request.queryParams.exp_param_name;
    if (gs.nil(exp_param_name)) {
        return new sn_ws_err.BadRequestError('No exp_param_name specified in request params');
    }

    var fallBackVariant = request.queryParams.fallback_variant;
    if (gs.nil(fallBackVariant)) {
        return new sn_ws_err.BadRequestError('No fallback_variant specified in request params');
    }

    var context = ExperimentationService.getContext(exp_param_name, fallBackVariant);
    var result = {
        "experimentId": context.getExperimentId(),
        "variant": context.getVariant(),
        "syncVersion": context.getSyncVersion(),
        "referenceDocumentation": context.getReferenceDocumentation(),
        "errorMsg": context.getErrorMsg(),
    };
    response.setContentType("application/json");
    response.setStatus(200);
    response.setBody(result);

})(request, response);
