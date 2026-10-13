(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var tmcManager = new sn_nocpit.TilemapContainerManager();
	var queryParams = request.queryParams;
	var workspace = queryParams.workspace;
	var timestamp = queryParams.timestamp || "-1";
	var query = queryParams.query;
	if (!query)
		query = '';
	
	// add to query filter by support_group for evt_team_operator role
	var user = gs.getUser();
	if(user.hasRole("evt_team_operator") && !(user.hasRole("evt_mgmt_user") || user.hasRole("evt_mgmt_admin") || user.hasRole("evt_mgmt_operator"))){
        var userGroups = user.getMyGroups();
		// Query for groups where the current user is a manager
        var userManagedGroups = new GlideRecord('sys_user_group');
        userManagedGroups.addQuery('manager', user.getID());
        userManagedGroups.query();

        while (userManagedGroups.next()) {
            var groupId = userManagedGroups.getValue('sys_id');
			// Check if the current group is not already in userGroups
            if(userGroups.indexOf(groupId) === -1)
				userGroups.push(groupId);
        }
		
        query+="^support_groupIN"+userGroups.join(',');
    }
	var responseString = String(tmcManager.getEMServices(workspace, query,timestamp));
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(responseString);

})(request, response);
