var UpgradeManagementUpdatePlaybookActivityState = Class.create();
UpgradeManagementUpdatePlaybookActivityState.prototype = {
    initialize: function() {},

    completeReviewReleaseNotesActivity: function() {
		try {
			var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
			upgradeSessionGR.get("status", "in_progress");
			upgradeSessionGR.orderByDesc('sys_updated_on');
			upgradeSessionGR.query();
			if (upgradeSessionGR.next()) {
				if (upgradeSessionGR.getValue("sys_pd_context_id")) {
					var activityContextGR = new GlideRecord('sys_pd_activity_context');
					activityContextGR.addQuery("context", upgradeSessionGR.getValue("sys_pd_context_id"));
					activityContextGR.addQuery("label", "Review release notes");
					activityContextGR.query();

					if (activityContextGR.next()) {
						if (activityContextGR.getValue("associated_record")) {
							var flowDataGR = new GlideRecord('sys_flow_data');
							flowDataGR.get(activityContextGR.getValue("associated_record"));
							flowDataGR.setValue("state", "COMPLETE");
							return flowDataGR.update();
						}
					}
				}
			}
			return "";
		} catch(error) {
			gs.info("Error in sn_upgrade_mgmt.UpgradeManagementUpdatePlaybookActivityState completeReviewReleaseNotesActivity function" + error);
			return "";
		}
    },

    type: 'UpgradeManagementUpdatePlaybookActivityState'
};
