function transform(input) {
        try {
            var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
            sessionGR.addQuery("status", "in_progress");
            sessionGR.orderByDesc('sys_updated_on');
            sessionGR.query();
            if (!sessionGR.next()) {
                throw new Error("No active upgrade sessions found");
            }
            var targetPatchID = sessionGR.getValue("target_patch_id");
            var upgradePlan = "Upgrade Plan - " + targetPatchID;
            var upgradePlanGR = new GlideRecord("sys_upgrade_plan");
            upgradePlanGR.addQuery("name", upgradePlan);
            upgradePlanGR.orderByDesc('sys_updated_on');
            upgradePlanGR.query();
            var sysID;
            if (upgradePlanGR.next()) {
              sysID = upgradePlanGR.getValue("sys_id");   
            } 
                 return {
                    sys_id: sysID || null,
                    link: sysID ? "/sys_upgrade_plan.do?sys_id=" + sysID : null,
                    plan_name: sysID ? upgradePlan : ''
                };

        } catch (e) {
            gs.error("Failed to retrieve upgrade plan: " + e);
        }
    }
