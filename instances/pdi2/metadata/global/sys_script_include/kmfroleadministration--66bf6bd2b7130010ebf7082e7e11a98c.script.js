var KMFRoleAdministration = Class.create();
KMFRoleAdministration.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    //Fetch and return a list of users (sys_id and name) who are admins and security_admins
    getAvailableUsers: function() {
        //Add the available users to select from
        var avalable_items = [];

        var available_users = new GlideRecord("sys_user_has_role");
	var inner_join = available_users.addJoinQuery("sys_user_has_role", "user", "user");
	available_users.addQuery("role.name", "admin").addOrCondition("role.name", "sn_kmf.admin");
	inner_join.addCondition("role.name", "security_admin").addOrCondition("role.name", "sn_kmf.admin");
	available_users.addNotNullQuery("user.name");
	available_users.query();

	var visited_user_sys_ids = [];
	while (available_users.next() && available_users.canRead()) {
		var avalable_item = {};
		var user_sys_id = available_users.user.sys_id.toString();
		avalable_item.sys_id = user_sys_id;
		avalable_item.name = available_users.user.name.toString();
		if (visited_user_sys_ids.indexOf(user_sys_id) === -1) {
			visited_user_sys_ids.push(user_sys_id);
			avalable_items.push(avalable_item);
		}
	}

        return JSON.stringify(avalable_items);
    },

    //Fetch and return a list of KMF admin user sys_id's
    getKMFAdminUserSysIds: function() {
        //Collect the KMF admin user sys_ids
        var kmf_admin_user_sys_ids = [];
	var kmf_admin_users = new GlideRecord("sys_user_has_role");
	kmf_admin_users.addQuery("role.name", "sn_kmf.admin");
	kmf_admin_users.query();

	while (kmf_admin_users.next() && kmf_admin_users.canRead()) {
		var user_sys_id = kmf_admin_users.user.sys_id.toString();
		if (kmf_admin_user_sys_ids.indexOf(user_sys_id) === -1)
			kmf_admin_user_sys_ids.push(user_sys_id);
	}

        return JSON.stringify(kmf_admin_user_sys_ids);
    },

    // Call the server side logic to process the user sys_ids for KMF admin role assignment
    assignKMFAdminRole: function() {
        var user_sys_ids = this.getParameter('sysparm_user_sys_ids');
        var administration_result = new SNC.KMFRoleAssignmentInterface().assignKMFAdminRole(user_sys_ids);
        if (!administration_result)
            gs.addErrorMessage(gs.getMessage("Error occurred on attempting to persist 'Key Management' admin role changes administered. Please see logs for more information"));
        else
            gs.addInfoMessage(gs.getMessage("Successfully persisted 'Key Management' admin role changes administered. User(s) with role changes have to logout and log back in to see the changes in effect."));
    },

    type: 'KMFRoleAdministration'
});
