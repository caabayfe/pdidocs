try {
    if (event && event.parm1) {
        var params = JSON.parse(event.parm1);
        if (params.event_type == "install") {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.get("status", "in_progress");
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.query();

            if (upgradeSessionGR.next()) {
				var pdContextGR = new GlideRecord("sys_pd_activity_context");
				pdContextGR.addQuery("context", upgradeSessionGR.getValue("sys_pd_context_id"));
				pdContextGR.addQuery("state", "IN_PROGRESS");
				pdContextGR.query();
				pdContextGR.next();
				if(pdContextGR.getDisplayValue("lane") && pdContextGR.getDisplayValue("lane").toLowerCase() === "post-upgrade") {
					var upgradePlanSysID = upgradeSessionGR.getValue("upgrade_plan");

					if (upgradePlanSysID) {

						var upgradePreviewAppGR = new GlideRecord("upgrade_preview_app");
						upgradePreviewAppGR.addQuery("upgrade_preview", upgradeSessionGR.getValue("upgrade_preview"));
						upgradePreviewAppGR.addQuery("scope", params.scope);
						upgradePreviewAppGR.addNotNullQuery("oob_version");
						upgradePreviewAppGR.query();
						var paramVersion = params.version;
						var trueUpVersion = null;
						if (upgradePreviewAppGR.next()) {

							trueUpVersion = upgradePreviewAppGR.getValue("oob_version");

							if (new sn_appclient.VersionComparator().isUpgrade(paramVersion, trueUpVersion)) {
								paramVersion = trueUpVersion;
							}
						}
						if (params && params.item_type && params.item_type == "application") {
							new sn_upgrade_mgmt.StoreAppsFlowUtils().setAppInUpgradePlan(params.scope, params.id, params.name, upgradePlanSysID, paramVersion, null, trueUpVersion);
						}
					}
				}
            }
        }
    }
} catch (error) {
    gs.info("Error in executing Add application to upgrade plan" + error);
}
