(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var reqParams = request.body.data;
    var conferenceDetails = reqParams.conferenceDetails;
    var conferenceAction = reqParams.action;
    if (!conferenceDetails || !conferenceAction) return new sn_ws_err.BadRequestError(gs.getMessage("Invalid Input Data"));
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.doConferenceAction(conferenceAction, conferenceDetails);

})(request, response);
