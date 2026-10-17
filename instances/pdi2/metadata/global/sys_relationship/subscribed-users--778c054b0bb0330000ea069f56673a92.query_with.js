(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var userIds = [];
	var userId = "";
	var subUserGR = new GlideRecord ("subscribed_users_with_role");
	subUserGR.addQuery("userrolect_role_ref", parent.sys_id);
	subUserGR.query();
		
	while (subUserGR.next()) {
		userId = subUserGR.getValue("userrolect_user");
		userIds.push(userId);
	}		
	current.addQuery('user', 'IN', userIds);
	current.addQuery('role', parent.sys_id);
	current.orderBy('user.name');

})(current, parent);
