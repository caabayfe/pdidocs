function transform(input) {
	
      var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
      upgradeSessionGR.addQuery('status', 'in_progress');
      upgradeSessionGR.orderByDesc('sys_updated_on');
      upgradeSessionGR.setLimit(1);
      upgradeSessionGR.query();

      if(!upgradeSessionGR.next())
        return;

        var upgradePlan = upgradeSessionGR.getValue('upgrade_plan');
        var sessionType = upgradeSessionGR.getValue('session_type');

      var existingPreviewTrackerStore = upgradeSessionGR.getValue('upgrade_preview_execution_tracker_store');

      if(input.caller === "\"Preview Store Apps\"" && existingPreviewTrackerStore){
          var trackerGRStore = new GlideRecord('sys_execution_tracker');
          if (trackerGRStore.get(existingPreviewTrackerStore)) {
                  var state = trackerGRStore.getValue('state');
                  if (state == 0 || state == 1 || state == 2) {
                     gs.info("[Upgrade Console] Previous upgrade preview store successful or running");
                     return existingPreviewTrackerStore;
                  }
          }
      }

      var existingPreviewTracker = upgradeSessionGR.getValue('upgrade_preview_execution_tracker');
      if(existingPreviewTracker){
          var trackerGR = new GlideRecord('sys_execution_tracker');
          if (trackerGR.get(existingPreviewTracker)) {
                  var state = trackerGR.getValue('state');
                  if (state == 0 || state == 1 || state == 2) {
                     gs.info("[Upgrade Console] Previous upgrade preview is still running");
                     return existingPreviewTracker;
                  }
          }
      }
    var apiUtil = new global.UpgradeManagementApiUtil();
    if(sessionType === 'bulk_app_update'){
        return apiUtil.triggerBulkAppUpgradePreview(upgradePlan, input.currentPatchId, input.targetPatchId);
    } else {
        return apiUtil.triggerUpgradePreview(input.currentPatchId, input.targetPatchId);
    }
}
