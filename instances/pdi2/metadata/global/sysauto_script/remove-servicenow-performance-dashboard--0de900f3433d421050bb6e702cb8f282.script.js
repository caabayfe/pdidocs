// This script removes the "Servicenow Performance" dashboard for customers who haven't used it
// in the past 6 months. It runs after upgrade, during a time when most customers don't have
// as much activity going on, because it has a query on the navigator history that may take some time.
// In order to run once and at a specific time of the week, this is a weekly script that disables
// itself after running.

var performanceDashboardID = "8d090efd53513010d185ddeeff7b124e";

function usedDashboard() {
    var ga = new GlideAggregate('sys_ui_navigator_history');
    ga.addEncodedQuery("sys_created_onRELATIVEGT@month@ago@6");
    ga.addQuery('url', 'CONTAINS', performanceDashboardID);
    ga.addQuery('url', 'DOES NOT CONTAIN', 'sys_ui_navigator_history');
    ga.addAggregate('COUNT');
    ga.query();
    if (ga.next()) {
        return ga.getAggregate('COUNT') > 0;
    }
    return false;
}

function deleteDashboardFiles(dashboardId) {
    var files = [];
    if (gs.nil(dashboardId)) {
        gs.addErrorMessage('dashboardId is empty.');
        return;
    }

    var gr = new GlideRecord('pa_dashboards');
    if (!gr.get(dashboardId)) {
        gs.addErrorMessage(dashboardId + ' is invalid dashboard ID');
        return;
    }
    files.push(['pa_dashboards', gr.getUniqueValue()]);

    // Add related tabs content
    var grDashboardTabs = new GlideRecord("pa_m2m_dashboard_tabs");
    grDashboardTabs.addQuery("dashboard", dashboardId);
    grDashboardTabs.query();
    while (grDashboardTabs.next()) {
        files.push(['pa_m2m_dashboard_tabs', grDashboardTabs.getUniqueValue()]);

        var tabSysId = grDashboardTabs.getValue("tab");
        var grTabs = new GlideRecord("pa_tabs");

        if (grTabs.get(tabSysId)) {
            files.push(['pa_tabs', grTabs.getUniqueValue()]);
            var canvasPageSysId = grTabs.getValue("canvas_page");
            var portalPageSysId = grTabs.getValue("page");

            // Add tab's related legacy page
            var grPortalPage = new GlideRecord("sys_portal_page");
            if (grPortalPage.get(portalPageSysId)) {
                files.push(['sys_portal_page', grPortalPage.getUniqueValue()]);

                var grPortal = new GlideRecord("sys_portal");
                grPortal.addQuery("page", portalPageSysId);
                grPortal.query();
                while (grPortal.next()) {
                    files.push(['sys_portal', grPortal.getUniqueValue()]);

                    var portalPreferenceGR = new GlideRecord('sys_portal_preferences');
                    portalPreferenceGR.addQuery('portal_section', grPortal.getUniqueValue());
                    portalPreferenceGR.query();
                    while (portalPreferenceGR.next())
                        files.push(['sys_portal_preferences', portalPreferenceGR.getUniqueValue()]);
                }
            }

            // Add tab's related canvas page
            var grGridCanvas = new GlideRecord("sys_grid_canvas");
            if (grGridCanvas.get(canvasPageSysId)) {
                files.push(['sys_grid_canvas', grGridCanvas.getUniqueValue()]);

                // Add grid canvas panes related to the canvas page
                var grGridCanvasPane = new GlideRecord('sys_grid_canvas_pane');
                grGridCanvasPane.addQuery("grid_canvas", grGridCanvas.getUniqueValue());
                grGridCanvasPane.query();
                while (grGridCanvasPane.next()) {
                    files.push(['sys_grid_canvas_pane', grGridCanvasPane.getUniqueValue()]);
                }

                var grCanvasPreferences = new GlideRecord('sys_canvas_preferences');
                grCanvasPreferences.addQuery('canvas_page', canvasPageSysId);
                grCanvasPreferences.query();
                while (grGridCanvasPane.next()) {
                    files.push(['sys_canvas_preferences', grCanvasPreferences.getUniqueValue()]);
                }
            }
        }
    }

    // Add dashboard permissions
    var grDashboardPermissions = new GlideRecord("pa_dashboards_permissions");
    grDashboardPermissions.addQuery("dashboard", dashboardId);
    grDashboardPermissions.query();
    while (grDashboardPermissions.next()) {
        files.push(['pa_dashboards_permissions', grDashboardPermissions.getUniqueValue()]);
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileGr = new GlideRecord(file[0]);
        fileGr.get(file[1]);
        fileGr.deleteRecord();
    }
}

function removeGraphsFromSlowPatternForms() {
    var sectionsToDelete = ['4171c6c8c3093200ca27ff9c02d3aee0', 'dbff5288c3413200ca27ff9c02d3aeae', '55007f503b113200d43625c703efc423',
        '03c4c20cc3093200ca27ff9c02d3aef6', 'feb4c20cc3093200ca27ff9c02d3aea2', '38977b3367703200ca27ebc172415a41',
        '7e973f3367703200ca27ebc172415a65', '65c8b8c1c3013200ca27ff9c02d3ae3c', 'bbb8b8c1c3013200ca27ff9c02d3ae51',
        '0ac54a0cc3093200ca27ff9c02d3aee7', '48c54a0cc3093200ca27ff9c02d3ae15'
    ];
    for (var i = 0; i < sectionsToDelete.length; i++) {
        var sectionId = sectionsToDelete[i];
        var gr = new GlideRecord('sys_ui_section');
        gr.get(sectionId);
        gr.deleteRecord();
    }
}

function disableJRobinWrites() {
    GlidePropertiesDB.set("com.glide.velocious.jrobin.disable_jrobin_writes", true);
}

if (!usedDashboard()) {
    deleteDashboardFiles(performanceDashboardID);
    removeGraphsFromSlowPatternForms();
    disableJRobinWrites();
}

var gr = new GlideRecord('sysauto_script');
gr.get('0de900f3433d421050bb6e702cb8f282');
gr.setValue('active', false);
gr.update();
