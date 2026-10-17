function transform(input) {
	// gs.info("now - In Preserve list DB - " +  input.upgrade_preview_sysid);
	var target_patch_id = input.target_patch_id; 
	var upgrade_plan_sysid = input.upgrade_plan_sysid;
	var upgrade_preview_sysid = input.upgrade_preview_sysid;
	var apiUtils = new sn_upgrade_mgmt.StoreAppsFlowUtils();
	return apiUtils.asyncPreservePreviewCurrentState(target_patch_id, upgrade_plan_sysid, upgrade_preview_sysid);
}
