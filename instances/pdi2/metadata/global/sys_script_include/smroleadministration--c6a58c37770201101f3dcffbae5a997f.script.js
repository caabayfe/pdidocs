var SMRoleAdministration = Class.create();
SMRoleAdministration.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	//Fetch and return a list of users (sys_id and name) who are admins and security_admins
	getAvailableUsers: function() {
		var available_items = [];
		
		var available_users = new GlideRecordSecure("sys_user_has_role");
		var inner_join = available_users.addJoinQuery("sys_user_has_role", "user", "user");
		available_users.addQuery("role.name", "admin").addOrCondition("role.name", "sn_secrets.admin");
		inner_join.addCondition("role.name", "security_admin").addOrCondition("role.name", "sn_secrets.admin");
		available_users.addNotNullQuery("user.name");
		available_users.query();
		
		var visited_user_sys_ids = [];
		while (available_users.next() && available_users.canRead()) {
			var available_item =  {};
			var user_sys_id = available_users.user.sys_id.toString();
			available_item.sys_id = user_sys_id;
			available_item.name = available_users.user.name.toString();
			if (visited_user_sys_ids.indexOf(user_sys_id) === -1) {
				visited_user_sys_ids.push(user_sys_id);
				available_items.push(available_item);
			}
		}
		return JSON.stringify(available_items);
	},
	
	// Fetch and return a list of SM admin user sys_id's
	getSMAdminUserSysIds: function() {
		var sm_admin_user_sys_ids = [];
		var sm_admin_users = new GlideRecordSecure("sys_user_has_role");
		sm_admin_users.addQuery("role.name", "sn_secrets.admin");
		sm_admin_users.query();
		
		while (sm_admin_users.next() && sm_admin_users.canRead()) {
			var user_sys_id = sm_admin_users.user.sys_id.toString();
			if (sm_admin_user_sys_ids.indexOf(user_sys_id) === -1)
				sm_admin_user_sys_ids.push(user_sys_id);
		}
		return JSON.stringify(sm_admin_user_sys_ids);
	},
	
	// Call the server side logic to process the user sys_ids for SM admin role assignment
	assignSMAdminRole: function() {
		var user_sys_ids = this.getParameter('sysparm_user_sys_ids');
		var administration_result = new SNC.SMRoleAssignmentInterface().assignSMAdminRole(user_sys_ids);
		if (!administration_result)
			gs.addErrorMessage(gs.getMessage("Error occurred on attempting to persist 'Secrets Management' admin role changes administered. Please see logs for more information"));
		else
			gs.addInfoMessage(gs.getMessage("Successfully persisted 'Secrets Management' admin role changes administered. User(s) with role changes have to logout and log back in to see the changes in effect."));
	},
    
    type: 'SMRoleAdministration'
});
