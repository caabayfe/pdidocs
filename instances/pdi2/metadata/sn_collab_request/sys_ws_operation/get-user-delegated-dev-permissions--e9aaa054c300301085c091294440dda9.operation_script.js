(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var appId = request.pathParams.appId;
	
	if (!UserDelegatedDevPermissions.isScopeValid(appId)) {
		UserDelegatedDevPermissions.throwAppNotFound(appId);
	}

	var permissionsGranted = UserDelegatedDevPermissions.getPermissionSetsGrantedToUserFromScope(appId);

	// if empty, then no permission sets are granted
	var grantedPermSetNameAndIds = UserDelegatedDevPermissions.getPermSetNamesAndIdsFromObj(permissionsGranted);
	
	response.setBody(grantedPermSetNameAndIds);
	response.setStatus(200);

})(request, response);
