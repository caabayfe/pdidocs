(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var statusCodes = CollabTaskConstants.statusCodes;
    var collaborationFeature = CollabTaskConstants.collaborationFeature;
    var appId = request.pathParams.application_sys_id;

    //Expected feature query param value : INVITE or JOIN
    var feature = !global.JSUtil.nil(request.queryParams.feature) ? request.queryParams.feature.toString().trim() : "";

    if (!appId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(statusCodes.BAD_REQUEST)
            .setMessage(gs.getMessage("Missing App Id"));
    }

    var payload = request.body.data;
    var descriptorId = payload.descriptorId;
    var users = payload.users;
    var groups = payload.groups;
    var sourceStudioName = payload.sourceStudioName;
    var optionalMessage = payload.optionalMessage;

    if (feature === collaborationFeature.JOIN) {
        var currentLoggedInUser = gs.getUserID();
        users = [currentLoggedInUser];
    }

    if ((!users || !users.length) && (!groups || !groups.length)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(statusCodes.BAD_REQUEST)
            .setMessage(gs.getMessage('Bad Request: There are no users or groups present in the payload.'));
    }

    if ((!descriptorId)) {
        throw new sn_ws_err.ServiceError()
            .setStatus(statusCodes.BAD_REQUEST)
            .setMessage(gs.getMessage('Missing descriptor Id.'));
    }

    var result = CollabTaskServiceV2.inviteCollaborators(users, groups, appId, descriptorId, feature, sourceStudioName, optionalMessage);

    response.setBody(result.body);
    response.setStatus(result.status);

})(request, response);
