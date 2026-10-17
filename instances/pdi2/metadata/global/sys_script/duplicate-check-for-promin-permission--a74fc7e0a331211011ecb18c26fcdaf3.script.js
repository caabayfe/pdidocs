(function executeRule(current, previous /*null when async*/) {
    var grPermission = new GlideRecord('promin_permission');

	var user = current.getValue("user");
	var group = current.getValue("group");
	var role = current.getValue("role");
	var projectId = current.getValue("project");

	var isUserExist = !gs.nil(user) && user != null;
	var isGroupExist = !gs.nil(group) && group != null;
	var isRoleExist = !gs.nil(role) && role != null;

	if(!isUserExist && !isGroupExist && !isRoleExist) {
		current.setAbortAction(true);
		return;
	}

	var encodedQuery = "";
	if (isUserExist) {
		encodedQuery = "project="+projectId+"^user=" + user +"^sys_id!="+ current.sys_id + "^NQ";
	}
	if (isGroupExist) {
		encodedQuery = encodedQuery + "project="+projectId+"^group=" + group + "^sys_id!="+ current.sys_id + "^NQ";
	}
	if (isRoleExist) {
		encodedQuery = encodedQuery + "project="+projectId+"^role=" + role + "^sys_id!="+ current.sys_id + "^NQ";
	}

	encodedQuery = encodedQuery.substr(0, encodedQuery.lastIndexOf("^NQ"));
	grPermission.addEncodedQuery(encodedQuery);
	grPermission.query();

	if(grPermission.hasNext()){
		gs.addErrorMessage(gs.getMessage("Duplicate Record: The user/group/role is/are already exists"));
		current.setAbortAction(true);
        gs.setRedirect(current);
	}

})(current, previous);
