
			if(!pm.isZboot()) {
    var gr = new GlideRecord('sys_trigger');
    gr.initialize();
    gr.name = 'Add Reports back to menu';
    gr.job_context = 'For upgrading customers to Australia we need to reintroduce the Reports menu item.';
    gr.next_action = '2006-10-23 15:51:10';
    gr.trigger_type = 0;

    var scriptFunction = function () {
        //First we need to make sure all old flows are deleted if they are still on the instance
        var VERSION_V1_OF_FLOW = "a0363aca4f21711054e85e8330ce0b7a";
        var VERSION_V2_OF_FLOW = "51e4991c37822210fcc8966f34924b36";
        var OLD_VERSION_OF_FIX_SCRIPT = "a56c293553130210828fddeeff7b1292";

        var flow_v1 = new GlideRecord('sys_hub_flow');
        if (flow_v1.get(VERSION_V1_OF_FLOW)) {
            if(flow_v1.deleteRecord()){
                gs.info('Deleted V1 of the flow: "Set visibility of Analytics applications"');
            }
        } else {
            gs.info('Flow V1 "Set visibility of Analytics applications" was not found.');
        }

        var flow_v2 = new GlideRecord('sys_hub_flow');
        if (flow_v2.get(VERSION_V2_OF_FLOW)) {
            if(flow_v2.deleteRecord()){
                gs.info('Deleted "Set visibility of Analytics applications(v2)"');
            }
        } else {
            gs.info('Flow V2 "Set visibility of Analytics applications" was not found.');
        }

        var old_fix_sctip = new GlideRecord('sys_script_fix');
        if (old_fix_sctip.get(OLD_VERSION_OF_FIX_SCRIPT)) {
            if(old_fix_sctip.deleteRecord())
                gs.info('Delete the previous version of Activate workflow script');
        }
        else {
            gs.info('Previous version of this script was not found');
        }

        // Platform analytics menu item needs to be activated
        var PLATFORM_ANALYTICS_MENU_ITEM_ID = "c27d2864e9693110f877eebc1a3288ff";
        // The Reports menu item needs to be reactivated for upgrading customers
        var REPORTS_MENU_ITEM_ID = "1018d17ec611227a01593ce6cce95c29";
        // This View/Run child menu item should be reactivated and remain visible under Reports
        var VIEW_RUN_MODULE_TO_ACTIVATE = "1166104fc611227b00bb1bc49f4845f4";
        // The Performance Analytics Menu needs to be completely deactivated
        var PERFORMANCE_ANALYTICS_MENU_ID = "00ede6001b120100763d91eebc07137f";
        // "System" creators
        var ADMIN_MAINT_CREATORS = ["admin", "maint", "glide.maint"];

        // Old workflow set glide.ui.report.old_report_builder to false when unified analytics got enabled.
        // In Australia all customers are by default unified analytics = true and cannot switch back.
        gs.setProperty("glide.ui.report.old_report_builder", false);

        // 1) Activate Platform Analytics Administration menu item
        gs.info("[ANALYTICS-MENU-MIGRATION]: Setting Platform Analytics Administration to true");
        var platform_analytics_menu = new GlideRecord("sys_app_application");
        platform_analytics_menu.addQuery("sys_id", PLATFORM_ANALYTICS_MENU_ITEM_ID);
        platform_analytics_menu.addQuery("sys_scope", "global");
        platform_analytics_menu.setLimit(1);
        platform_analytics_menu.query();

        if (platform_analytics_menu.next()) {
            platform_analytics_menu.setValue("active", true);
            platform_analytics_menu.update();
        } else {
            gs.info("[ANALYTICS-MENU-MIGRATION]: Platform Analytics Administration sys_app_application not found, continuing");
        }

        // 2) Deactivate Performance Analytics from the menu
        gs.info("[ANALYTICS-MENU-MIGRATION]: Removing Performance Analytics from menu");
        var performance_analytics_menu = new GlideRecord("sys_app_application");
        performance_analytics_menu.addQuery("sys_id", PERFORMANCE_ANALYTICS_MENU_ID);
        performance_analytics_menu.addQuery("sys_scope", "global");
        performance_analytics_menu.setLimit(1);
        performance_analytics_menu.query();

        if (performance_analytics_menu.next()) {
            gs.info("[ANALYTICS-MENU-MIGRATION]: Found Performance Analytics Menu");
            performance_analytics_menu.setValue("active", false);
            performance_analytics_menu.update();

            // Re-parent Performance Analytics modules created_by NOT in [admin, maint, glide.maint]
            var performanceAnalyticsChildMenuItems = new GlideRecord("sys_app_module");
            performanceAnalyticsChildMenuItems.addQuery("application", PERFORMANCE_ANALYTICS_MENU_ID);
            performanceAnalyticsChildMenuItems.query();

            while (performanceAnalyticsChildMenuItems.next()) {
                if (!ADMIN_MAINT_CREATORS.includes(performanceAnalyticsChildMenuItems.getValue("sys_created_by"))) {
                    gs.info("[ANALYTICS-MENU-MIGRATION]: Re-parenting Performance Analytics module to Platform Analytics: " + performanceAnalyticsChildMenuItems.getUniqueValue());
                    performanceAnalyticsChildMenuItems.setValue("application", PLATFORM_ANALYTICS_MENU_ITEM_ID);
                    performanceAnalyticsChildMenuItems.update();
                }
            }
        } else {
            gs.info("[ANALYTICS-MENU-MIGRATION]: Performance Analytics sys_app_application not found, skipping PA deactivation + module re-parenting");
        }

        // 3) Reports menu: set active=true again, but hide all modules except View/Run
        gs.info("[ANALYTICS-MENU-MIGRATION]: Start adding Reports menu item back to the menu");
        var reportsMenuItem = new GlideRecord("sys_app_application");
        reportsMenuItem.addQuery("sys_id", REPORTS_MENU_ITEM_ID);
        reportsMenuItem.addQuery("sys_scope", "global");
        reportsMenuItem.setLimit(1);
        reportsMenuItem.query();

        if (reportsMenuItem.next()) {
            gs.info("[ANALYTICS-MENU-MIGRATION]: Found Reports sys_app_application");
            reportsMenuItem.setValue("active", true);
            reportsMenuItem.update();

            var reportsChildMenuItem = new GlideRecord("sys_app_module");
            reportsChildMenuItem.addQuery("application", REPORTS_MENU_ITEM_ID);
            reportsChildMenuItem.query();

            while (reportsChildMenuItem.next()) {
                // Keep View/Run visible under Reports
                if (reportsChildMenuItem.getUniqueValue() == VIEW_RUN_MODULE_TO_ACTIVATE) {
                    gs.info("[ANALYTICS-MENU-MIGRATION]: Keeping View/Run active under Reports: " + VIEW_RUN_MODULE_TO_ACTIVATE);

                    if (reportsChildMenuItem.getValue("active") != "true") {
                        reportsChildMenuItem.setValue("active", true);
                    }
                    reportsChildMenuItem.update();
                    continue;
                }

                // For all other Reports modules:
                // - if created_by is NOT admin/maint/glide.maint -> move to Platform Analytics menu
                // - disable them so they don't show under Reports when Reports app is active
                if (!ADMIN_MAINT_CREATORS.includes(reportsChildMenuItem.getValue("sys_created_by"))) {
                    gs.info("[ANALYTICS-MENU-MIGRATION]: Moving Reports module to Platform Analytics and disabling: " + reportsChildMenuItem.getUniqueValue());
                    reportsChildMenuItem.setValue("application", PLATFORM_ANALYTICS_MENU_ITEM_ID);
                } else {
                    gs.info("[ANALYTICS-MENU-MIGRATION]: Disabling Reports module (admin/maint/glide.maint): " + reportsChildMenuItem.getUniqueValue());
                }

                if (reportsChildMenuItem.getValue("active") != "false") {
                    reportsChildMenuItem.setValue("active", false);
                }

                reportsChildMenuItem.update();
            }

        } else {
            gs.info("[ANALYTICS-MENU-MIGRATION]: Reports sys_app_application does not exist, skipping menu recreation");
        }

        // 4) Reactivate any inactive modules under Platform Analytics Administration
        // (Moved modules might have been inactive; we want them visible under the new menu)
        gs.info("[ANALYTICS-MENU-MIGRATION]: Reactivating inactive modules under Platform Analytics Administration");
        var paModules = new GlideRecord("sys_app_module");
        paModules.addQuery("application", PLATFORM_ANALYTICS_MENU_ITEM_ID);
        paModules.addQuery("active", false);
        paModules.query();

        while (paModules.next()) {
            paModules.setValue("active", true);
            paModules.update();
        }

        gs.info("[ANALYTICS-MENU-MIGRATION]: Reports menu recreation completed");
    };

    var scriptContent = scriptFunction.toString();
    scriptContent = scriptContent
        .substring(scriptContent.indexOf('{') + 1, scriptContent.lastIndexOf('}'))
        .trim();

    gr.setValue('script', scriptContent);

    var triggerId = gr.insert();
    if (triggerId) {
        gs.info('[ANALYTICS-MENU-MIGRATION]: Created scheduled job "Add Reports back to menu" with sys_id: ' + triggerId);
    } else {
        gs.error('[ANALYTICS-MENU-MIGRATION]: Failed to create scheduled job "Add Reports back to menu"');
    }
}
