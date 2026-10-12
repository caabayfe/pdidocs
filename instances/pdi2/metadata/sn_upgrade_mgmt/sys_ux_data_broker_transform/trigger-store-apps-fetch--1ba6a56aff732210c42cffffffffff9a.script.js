function transform(input) {
	gs.info("[Upgrade Console] Trying to trigger store app tracker");
	var target_patch_id = input.target_patch_id;
	var upgrade_session_id = input.upgrade_session_id;

	var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
	upgradeSessionGR.get(upgrade_session_id);
	var storeTracker = upgradeSessionGR.getValue('store_incoming_apps_exec_tracker');

	if(storeTracker){
		var trackerGR = new GlideRecord('sys_execution_tracker');
		trackerGR.get(storeTracker);
		if (trackerGR.getValue('state') != 3) {
			gs.info("[Upgrade Console] Previous Store tracker exists but it is not failed. So no need to run it again");
			return storeTracker;
		}
	}

	var trackerID = new sn_upgrade_mgmt.StoreAppsFlowUtils().asyncFetchIncomingStoreApps(target_patch_id, upgrade_session_id);
    return trackerID;
}
