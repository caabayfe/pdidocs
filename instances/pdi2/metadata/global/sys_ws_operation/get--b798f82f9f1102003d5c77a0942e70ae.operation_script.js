(function runOperation(/*RESTServiceRequest*/ request, /*RESTServiceResult*/ response) {
	var userSysId = request.queryParams.user_sysid;
	var rmAPI = new SNC.RoleManagementAPI();
	var userName = rmAPI.getUserNameById(userSysId);
	var pathsR = rmAPI.findAllRolePathsForUserAsString(userSysId);
	var pathsG = rmAPI.findAllRolePathsForUserFromGroupsAsString(userSysId);
	return {
		"user_name": userName,
		"from_role": GlideStringUtil.split(pathsR, '\n'),
		"from_group": GlideStringUtil.split(pathsG,'\n')
	};
})(request, response);
