function transform(input) {
	var sys_pd_context_sys_id = input.sys_pd_context_sys_id; 
	var sys_pd_activity_context_sys_id = input.sys_pd_activity_context_sys_id;
	var apiUtils = new sn_upgrade_mgmt.UpgradeManagementUtil();
	return apiUtils.restartActivity(sys_pd_context_sys_id, sys_pd_activity_context_sys_id);
}
