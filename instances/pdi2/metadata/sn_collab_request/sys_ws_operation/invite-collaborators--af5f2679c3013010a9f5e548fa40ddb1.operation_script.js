(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var statusCodes = CollabTaskConstants.statusCodes;

    var appId = request.pathParams.application_sys_id;

	//expected feature query param : INVITE or JOIN
	var feature = !global.JSUtil.nil(request.queryParams.feature)?request.queryParams.feature.toString().trim():"";
	
    if (!appId) {
        throw new sn_ws_err.ServiceError()
            .setStatus(statusCodes.BAD_REQUEST)
            .setMessage(gs.getMessage("Missing App Id"));
    }

    var payload = request.body.data;
    var descriptorId = payload.descriptorId;
    var users = payload.users;
    var groups = payload.groups;

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

    var result = CollabTaskService.inviteCollaborators(users, groups, appId, descriptorId, feature);

    response.setBody(result.body);
    response.setStatus(result.status);

})(request, response);
