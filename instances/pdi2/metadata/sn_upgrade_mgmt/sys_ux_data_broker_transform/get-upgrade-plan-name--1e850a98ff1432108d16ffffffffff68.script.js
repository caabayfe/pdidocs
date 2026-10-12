	function transform(input) {
    try {
        var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
        sessionGR.addQuery("status", "in_progress");
        sessionGR.orderByDesc('sys_updated_on');
        sessionGR.query();   
        if (!sessionGR.next()) {
            throw new Error("No active upgrade sessions found");
        }
        var sysID, planName;
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
            sys_id: sysID || null,
            plan_name: planName || ''
        };

    } catch (e) {
        gs.error("Failed to retrieve upgrade plan: " + e);
    }
}
