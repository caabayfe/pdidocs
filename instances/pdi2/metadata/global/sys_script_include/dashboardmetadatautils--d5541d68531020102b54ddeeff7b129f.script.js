var DashboardMetadataUtils = Class.create();
DashboardMetadataUtils.prototype = {
    initialize: function() {},
    getDashboardContent: function(dashboardSysId) {
        var dashboard = new Object();
        dashboard.sysId = dashboardSysId;

        var tabs = [];
        // get info about all the tabs associated with this dashboard
        var grDashboardsM2mTabs = new GlideRecord('pa_m2m_dashboard_tabs');
        grDashboardsM2mTabs.addQuery('dashboard', dashboardSysId);
        grDashboardsM2mTabs.query();
        while (grDashboardsM2mTabs.next()) {
            var tabSysId = grDashboardsM2mTabs.getValue('tab');

            var grTabs = new GlideRecord('pa_tabs');
            if (grTabs.get(tabSysId)) { // valid dashboard tab
                var tab = new Object();
                tab.sysId = tabSysId;
                // get dashboard tab content (for responsive dashboards we will look at the canvas records directly, but OOTB those records are not populated for all the dashboards. in that case we will count on the portal page content which should be kept in synch)
                var canvasPageSysId = grTabs.getValue('canvas_page');
                var portalPageSysId = grTabs.getValue('page');

                var widgetsInfo = [];

                if (canvasPageSysId) // valid canvas page
                    widgetsInfo = this.getContentCanvasPage(canvasPageSysId);
                else // check the portal page 
                    widgetsInfo = this.getContentLegacyPage(portalPageSysId);

                tab.noOfWidgets = widgetsInfo.length;
                tab.widgets = widgetsInfo;
                tabs.push(tab);
            }
        }

        dashboard.noOfTabs = tabs.length;
        dashboard.tabs = tabs;

        gs.print(JSON.stringify(dashboard));
        return dashboard;
    },
    getContentCanvasPage: function(canvasPageSysId) {
        var widgetsInfo = [];
        var grGridCanvas = new GlideRecord('sys_grid_canvas');
        if (grGridCanvas.get(canvasPageSysId)) {
            var grGridCanvasPane = new GlideRecord('sys_grid_canvas_pane');
            grGridCanvasPane.addQuery('grid_canvas', grGridCanvas.getUniqueValue());
            grGridCanvasPane.query();
            while (grGridCanvasPane.next()) {
                // get widget key preferences from the portal preferences
                var portalSectionSysId = grGridCanvasPane.getValue('portal_widget');
                var widgetInfo = this.getWidgetInfoFromPortal(portalSectionSysId);
                // add layout info
                var layout = new Object();
                layout.posx = grGridCanvasPane.getValue('posx');
                layout.posy = grGridCanvasPane.getValue('posy');
                layout.height = grGridCanvasPane.getValue('height');
                layout.width = grGridCanvasPane.getValue('width');
                widgetInfo.layout = layout;

                widgetsInfo.push(widgetInfo);
            }
        }
        return widgetsInfo;
    },
    getContentLegacyPage: function(portalPageSysId) {
        var widgetsInfo = [];
        var grPortalPage = new GlideRecord('sys_portal_page');
        if (grPortalPage.get(portalPageSysId)) {
            // For each page, get the widgets
            var grPortal = new GlideRecord('sys_portal');
            grPortal.addQuery('page', portalPageSysId);
            grPortal.query();
            while (grPortal.next()) {
                var portalSectionSysId = grPortal.getUniqueValue();
                widgetsInfo.push(this.getWidgetInfoFromPortal(portalSectionSysId));
            }
        }
        return widgetsInfo;
    },
    getWidgetInfoFromPortal: function(portalSectionSysId) {
        // Get widget Info
        var keyPreferences = ['renderer', 'sys_id', 'title', 'type'];
        var widget = new Object();
        widget.portalSectionSysId = portalSectionSysId;
        var grPortalPreferences = new GlideRecord('sys_portal_preferences');
        grPortalPreferences.addQuery('portal_section', portalSectionSysId);
        grPortalPreferences.query();
        while (grPortalPreferences.next()) {
            var prefName = grPortalPreferences.getValue('name');
            var prefValue = grPortalPreferences.getValue('value');
            if (keyPreferences.indexOf(prefName) != -1)
                widget[prefName] = prefValue;
        }
        // Mark as supported PAR widgets (PA  widgets except workbench, reports and interactive filters)
        var supportedRenderers = ['com.snc.pa.ui.RenderPerformanceAnalytics', 'com.glideapp.home.RenderHomepagePublishers', 'com.glide.ui.portal.RenderReport'];
        widget.supported = widget.renderer && supportedRenderers.indexOf(widget.renderer) != -1 && widget.type && widget.type === 'process';

        return widget;
    },

    type: 'DashboardMetadataUtils'
};
