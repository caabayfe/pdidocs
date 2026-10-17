
            // Populate ready_to_migrate column on analytics_dashboard
var PopulateReadyToMigrate = Class.create();
PopulateReadyToMigrate.prototype = Object.extendsObject(PopulateReadyToMigrate, {

    populateAllDashboardsReadyToMigrateColumns: function() {
        var dashboardGr = new GlideRecord("analytics_dashboard");
        dashboardGr.queryNoDomain();
        gs.info("COREUI_MIGRATION: Found " + dashboardGr.getRowCount() + " dashboards to process");
        while (dashboardGr.next()) {
            this.populateReadyToMigrateColumn(dashboardGr);
        }
        gs.info("COREUI_MIGRATION: Finished populating ready_to_migrate column for all dashboards");
    },

    populateSelectedDashboardsReadyToMigrateColumns: function(dashIdArr) {
        if (!dashIdArr || dashIdArr.length === 0) return;
        var dashGR = new GlideRecord('analytics_dashboard');
        dashGR.addQuery('sys_id', 'IN', dashIdArr.join(','));
        dashGR.queryNoDomain();
        while (dashGR.next())
            this.populateReadyToMigrateColumn(dashGR);
    },

     populateReadyToMigrateColumn: function(dashboardGr) {
        var dashboardSysId = dashboardGr.getValue("sys_id");
        var dashboardName = dashboardGr.getDisplayValue("name");

        gs.info("COREUI_MIGRATION: Processing dashboard " + dashboardSysId + " (" + dashboardName + ")");

        // Step 1: Get migration flag
        var migrationFlag = this.getMigrationFlag(dashboardGr);

        // Step 2: Update record
        dashboardGr.ready_to_migrate = migrationFlag;
		dashboardGr.setWorkflow(false);
        if (!dashboardGr.update()) {
            gs.error("COREUI_MIGRATION: Failed to update ready_to_migrate for dashboard " + dashboardSysId);
        } else {
            gs.info("COREUI_MIGRATION: Successfully updated dashboard " + dashboardSysId + " → ready_to_migrate = " + migrationFlag);
        }
    },

    /**
     * Derives the migration flag value (Yes, No, Not Applicable, Already Migrated)
     * @param {GlideRecord} dashboardGr - analytics_dashboard record
     * @return {String} migrationFlag
     */
    getMigrationFlag: function(dashboardGr) {
        var dashboardSysId = dashboardGr.getUniqueValue();

        // Case 0: Is only a next experience dashboard
        var paDashGr = new GlideRecord("pa_dashboards");
        if (!paDashGr.get(dashboardSysId)) {
            gs.info("COREUI_MIGRATION: No matching pa_dashboard found for " + dashboardSysId + ". It is a Next Experience → Not Applicable");
            return "Not Applicable";
        }

        // Case 1: If it's a coreui dashboard, check if dashboard content is migratable
        var isDashboardMigratable = this.isDashboardMigratable(dashboardSysId);
        if (!isDashboardMigratable) {
            gs.info("COREUI_MIGRATION: Dashboard is not migratable → No");
            return "No";
        }

        // At this point we know the dashboard is migratable
        // Now check the experience dashboard status
        var expDashboard = paDashGr.getValue("experience_dashboard");

        // Check if experience dashboard reference is valid (not null, not "undefined", not empty)
        var hasValidExpDashboard = expDashboard &&
                                   expDashboard !== "undefined" &&
                                   expDashboard.trim() !== "";

        if (!hasValidExpDashboard) {
            // 1.1 No experience dashboard or invalid reference → can migrate
            gs.info("COREUI_MIGRATION: No valid experience dashboard reference → Yes");
            return "Yes";
        }

        // 1.2 Has valid experience dashboard reference - check if it exists and is active
        var expGr = new GlideRecord("par_dashboard");
        if (!expGr.get(expDashboard)) {
            // Experience dashboard reference exists but record not found → can migrate
            gs.warn("COREUI_MIGRATION: experience_dashboard " + expDashboard + " not found in par_dashboard → invalid ref, can migrate → Yes");
            return "Yes";
        }

        // Experience dashboard exists - check if it's active
        var isExpDashboardActive = expGr.getValue("active") == "1";
        if (isExpDashboardActive) {
            gs.info("COREUI_MIGRATION: Experience dashboard is active → Already Migrated");
            return "Already Migrated";
        } else {
            gs.info("COREUI_MIGRATION: Experience dashboard is inactive → Yes");
            return "Yes";
        }
    },

    /**
     * Checks if a dashboard is migratable based on its widgets and renderers
     * Replacement that is more robust & logged
     */
    isDashboardMigratable: function(dashboardSysId) {
        gs.info("COREUI_MIGRATION: isDashboardMigratable START for " + dashboardSysId);
        var compatibilityList = [
            "com.snc.pa.ui.RenderPerformanceAnalytics",
            "com.glide.ui.portal.RenderReport",
            "com.glideapp.home.RenderHomepagePublishers",
            "com.glide.cms.RenderBlock"
        ];
        var compatTypesList = ["content_block_static"];

        try {
            // 1) collect pages from tabs
            var pages = [];
            var grDashboardTabs = new GlideRecord('pa_m2m_dashboard_tabs');
            grDashboardTabs.addQuery('dashboard', dashboardSysId);
            grDashboardTabs.queryNoDomain();
            while (grDashboardTabs.next()) {
                var tabSysId = grDashboardTabs.getValue('tab');
                var grTab = new GlideRecord('pa_tabs');
                if (grTab.get(tabSysId)) {
                    var pageSysId = grTab.getValue('page');
                    if (pageSysId) pages.push(pageSysId);
                }
            }

            if (pages.length === 0) {
                gs.info("COREUI_MIGRATION: No tabs found for dashboard " + dashboardSysId + " → migratable = true");
                return true;
            }

            // 2) get portal (widget) sys_ids
            var portalSysIds = this.getPortalSysIds(pages);
            gs.info("COREUI_MIGRATION: portalSysIds for " + dashboardSysId + " => " + JSON.stringify(portalSysIds));

            if (portalSysIds.length === 0) {
                gs.info("COREUI_MIGRATION: No widgets found for dashboard " + dashboardSysId + " → migratable = true");
                return true;
            }

            // 3) query preferences for those portal sections
            var prefGr = new GlideRecord('sys_portal_preferences');
            prefGr.addQuery('portal_section', 'IN', portalSysIds.join(','));
            prefGr.queryNoDomain();

            // 4) build map: portal_section => { name: '...', type: '...' }
            var renderersMap = {};
            while (prefGr.next()) {
                var portal_section = prefGr.getValue('portal_section');
                var prefName = String(prefGr.getValue('name') || '').toLowerCase().trim();
                var prefValue = String(prefGr.getValue('value') || '').trim();

                var renderer = renderersMap[portal_section] || {
                    name: '',
                    type: ''
                };
                if (prefName === 'renderer') {
                    renderer.name = prefValue;
                } else if (prefName === 'type') {
                    renderer.type = prefValue;
                }

                renderersMap[portal_section] = renderer;
            }

            var rendererCount = Object.keys(renderersMap).length;

            // 5) If fewer renderer entries than widgets → missing data → not migratable
            if (rendererCount < portalSysIds.length) {
                gs.info("COREUI_MIGRATION: Not all widgets have renderer info for dashboard " + dashboardSysId + " → migratable = false");
                return false;
            }

            // 6) Validate each widget's renderer
            for (var i = 0; i < portalSysIds.length; i++) {
                var portalId = portalSysIds[i];
                var rendererInMap = renderersMap[portalId];

                // If no entry or no renderer name → treat as incompatible
                if (!rendererInMap || !rendererInMap.name || rendererInMap.name.trim() === '') {
                    gs.info("COREUI_MIGRATION: Missing renderer name for widget " + portalId + " → migratable = false");
                    return false;
                }

                var rName = rendererInMap.name.trim();
                var rType = (rendererInMap.type || '').trim();

                gs.info("COREUI_MIGRATION: Validating widget " + portalId + " -> renderer=" + rName + " type=" + rType);

                // If renderer not in allowed list → incompatible
                if (compatibilityList.indexOf(rName) === -1) {
                    gs.info("COREUI_MIGRATION: Incompatible renderer " + rName + " → migratable = false");
                    return false;
                }

                // If it's a RenderBlock, check the type is allowed
                if (rName === "com.glide.cms.RenderBlock") {
                    if (!rType || compatTypesList.indexOf(rType) === -1) {
                        gs.info("COREUI_MIGRATION: Incompatible RenderBlock type " + rType + " → migratable = false");
                        return false;
                    }
                }
            }

            // passed all checks
            gs.info("COREUI_MIGRATION: All renderers compatible for dashboard " + dashboardSysId + " → migratable = true");
            return true;

        } catch (e) {
            gs.error("COREUI_MIGRATION: Error checking if dashboard " + dashboardSysId + " is migratable: " + e);
            return false;
        }
    },

 	/**
     * Helper function to get all portal sys_ids from pages
     * @param {Array} pages - List of page sys_ids
     * @return {Array} - List of portal sys_ids
     */
    getPortalSysIds: function(pages) {
        var pagesList = pages.slice();

        var grc = new GlideRecord('sys_grid_canvas');
        grc.addQuery('sys_id', 'IN', pagesList.join(','));
        grc.queryNoDomain();

        while (grc.next()) {
            var legacyPage = grc.getValue('legacy_page');
            if (legacyPage) {
                pagesList.push(legacyPage);
            }
        }

        var grp = new GlideRecord('sys_portal');
        grp.addQuery('page', 'IN', pagesList.join(','));
        grp.queryNoDomain();

        var portalSysIds = [];
        while (grp.next()) {
            portalSysIds.push(grp.getUniqueValue());
        }

        return portalSysIds;
    }
});
