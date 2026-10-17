(function(context, pageParams, blockcontext) {
    // Get count of tabs which have no active mapped dashboards or are inactivated themselves
    var inactiveTabCount = 0;
    var grTabs1 = new GlideRecord("sn_sd_kpi_category");
    grTabs1.addQuery("dashboard_type", "operational_success");
    grTabs1.query();

    while (grTabs1.next()) {
        if (grTabs1.active == false) {
            inactiveTabCount++;
        } else {
            var grM2m1 = new GlideRecord("sn_sd_tab_m2m_dashboard");
            grM2m1.addQuery("tab", grTabs1.sys_id);
            grM2m1.addQuery("active", "true");
            grM2m1.query();

            if (grM2m1.next()) {
                continue;
            }
            inactiveTabCount++;
        }
    }

    // Get tab array of objects for advance options repeater
    var serviceGroupId = "0a7f1437533011101d87ddeeff7b12da";
    if (blockcontext && blockcontext.selectedServiceGroup) {
        serviceGroupId = blockcontext.selectedServiceGroup.id;
    }
    var activeOriginalTabs = [];
    var grTabs2 = new GlideRecord("sn_sd_tab_m2m_dashboard");
    grTabs2.addQuery("service_group", serviceGroupId);
    grTabs2.addQuery("tab.dashboard_type", "operational_success");
    grTabs2.addQuery("tab.active", true);
    grTabs2.addQuery("template", true);
    grTabs2.orderBy("tab.order");
    grTabs2.query();

    while (grTabs2.next()) {
        var tmpActiveOriginalTabObj = {};
        tmpActiveOriginalTabObj.label = grTabs2.getDisplayValue("tab.name");
        tmpActiveOriginalTabObj.description = grTabs2.getDisplayValue("par_dashboard.description");
        tmpActiveOriginalTabObj.parDashboardSysId = grTabs2.getValue("par_dashboard");

        var grTabM2m = new GlideRecord("sn_sd_tab_m2m_dashboard");
        grTabM2m.addEncodedQuery("tab=" + grTabs2.getValue("tab") + "^par_dashboard!=NULL");
        grTabM2m.addQuery("active", true);
        grTabM2m.orderBy("template");
        grTabM2m.orderBy("order");
        grTabM2m.query();

        if (grTabM2m.next()) {
            oob = (grTabM2m.getValue("template") == "0") ? false : true;

            if (oob) {
                tmpActiveOriginalTabObj.oobBadge = {
                    color: "low",
                    label: gs.getMessage("Out of the box")
                };
            } else {
                tmpActiveOriginalTabObj.oobBadge = {
                    color: "info",
                    label: gs.getMessage("Custom")
                };
            }
        } else {
            tmpActiveOriginalTabObj.oobBadge = {
                color: "pink",
                label: gs.getMessage("Inactive")
            };
        }

        tmpActiveOriginalTabObj.oobTabButton = {
            label: gs.getMessage("Review and configure"),
            event: "Advance options card button event",
            tooltipContent: gs.getMessage("Review and configure the data visualization available in the base system for {0}", tmpActiveOriginalTabObj.label),
            configAria: {
                "button": {
                    "aria-description": gs.getMessage("Review and configure the data visualization available in the base system for {0}", tmpActiveOriginalTabObj.label),
                    "aria-label": gs.getMessage("Review and configure the data visualization available in the base system for {0}", tmpActiveOriginalTabObj.label)
                }
            }
        };

        activeOriginalTabs.push(tmpActiveOriginalTabObj);
    }

    // Get badge object for configure card
    var inactiveTabBadge = {};
    if (inactiveTabCount == 0) {
        inactiveTabBadge.color = "positive";
        inactiveTabBadge.label = gs.getMessage("All set");
    } else {
        inactiveTabBadge.color = "pink";
        inactiveTabBadge.label = gs.getMessage("Configuration needed");
    }

    inactivateTabButton = {
        label: gs.getMessage("Review and configure"),
        event: "Configure card button event",
        tooltipContent: gs.getMessage("Review and Configure the PA dashboard associated with these KPI categories"),
        configAria: {
            "button": {
                "aria-description": gs.getMessage("Review and Configure the PA dashboard associated with these KPI categories"),
                "aria-label": gs.getMessage("Review and Configure the PA dashboard associated with these KPI categories")
            }
        }
    };

    return {
        array: activeOriginalTabs,
        inactiveTabScore: {
            title: gs.getMessage("Inactive tabs"),
            score: inactiveTabCount
        },
        inactiveTabBadge: inactiveTabBadge,
        inactivateTabButton: inactivateTabButton
    };
})(context, pageParams, blockcontext);
