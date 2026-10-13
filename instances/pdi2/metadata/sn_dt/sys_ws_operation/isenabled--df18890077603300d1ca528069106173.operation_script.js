(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var parms = request.body.data.parms;
    var isEnabledResponse = sn_dt_api.DynamicTranslation.isEnabled(parms);
    response.setStatus(200);
    response.setBody(isEnabledResponse);
    return response;
})(request, response);
