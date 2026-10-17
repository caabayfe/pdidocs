(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var conferenceDetails = getQueryParam(request, "conferenceDetails");
    var conferenceAction = String(getQueryParam(request, "action"));
    var conferenceDetailsObj;
    try {
        conferenceDetailsObj = JSON.parse(conferenceDetails);
    } catch (e) {
        return new sn_ws_err.BadRequestError(gs.getMessage("Invalid input data"));
    }
    if (!conferenceDetails || !conferenceAction) return new sn_ws_err.BadRequestError(gs.getMessage("Invalid input data"));
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.doConferenceAction(conferenceAction, conferenceDetailsObj);

})(request, response);


function getQueryParam(request, param_name) {
    if (request.queryParams[param_name])
        return request.queryParams[param_name][0];
    else
        return null;
}
