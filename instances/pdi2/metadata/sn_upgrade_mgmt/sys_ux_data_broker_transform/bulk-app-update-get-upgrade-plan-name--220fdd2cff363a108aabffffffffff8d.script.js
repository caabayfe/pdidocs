function transform(input) {
	try {
		var sysID = null, planName = '';
		
		var sessionGR = new GlideRecord('sn_blk_app_update_sessions');
		sessionGR.addQuery("status", "in_progress");
		sessionGR.orderByDesc('sys_updated_on');
		sessionGR.query();
		if (!sessionGR.next()) {
			gs.error("No active upgrade sessions found");
			return {
				sys_id: sysID,
				plan_name: planName
			};
		}
		
		if (sessionGR.isValidField("upgrade_plan")) {
			var planRef = sessionGR.getValue("upgrade_plan");
			if (planRef) {
				var upgradePlanGR = new GlideRecord("sys_upgrade_plan");
				if (upgradePlanGR.get(planRef)) {
					sysID = upgradePlanGR.getValue("sys_id");
					planName = upgradePlanGR.getValue("name");
				}
			}
		}
		return {
			sys_id: sysID,
			plan_name: planName
		};

	} catch (e) {
		gs.error("Failed to retrieve upgrade plan: " + e);
	}
}
