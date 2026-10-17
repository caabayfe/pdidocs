isValidChange();

function isValidChange(/*GlideRecord current, GlideDateTime updatedOn, String updatedBy, String changedFields*/) {
	//Return true if the user that updated the record has an admin role
	return isUserAdmin(updatedBy);
}

function isUserAdmin(userName){
	var grUser = new GlideRecord("sys_user");
	grUser.addQuery('name', userName);
	grUser.query();
	if(grUser.next()) {
		var roles = new GlideRecord ("sys_user_has_role");
		roles.addActiveQuery();
		roles.addQuery('user', grUser.sys_id);
		roles.query();
		while(roles.next()) {
			if(roles.role.name == 'sn_cmdb_admin' || roles.role.name == 'admin')
				return true;
		}
	}
	return false;
}
