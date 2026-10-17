// Keep the dashboard form opened
action.setRedirectURL(current);

// Add current dashboard record
SNC.ContentUnloader.unloadMetadata(current);

// Add related tabs content
var grDashboardTabs = new GlideRecord("pa_m2m_dashboard_tabs");
grDashboardTabs.addQuery("dashboard", current.sys_id);
grDashboardTabs.query();
while (grDashboardTabs.next()) {
	var tabSysId = grDashboardTabs.getValue("tab");
	var grTabs = new GlideRecord("pa_tabs");
	
	if (grTabs.get(tabSysId)) {
		var canvasPageSysId = grTabs.getValue("canvas_page");
		var portalPageSysId = grTabs.getValue("page");
		
		// Add tab's related legacy page
		var grPortalPage = new GlideRecord("sys_portal_page");
		if (grPortalPage.get(portalPageSysId)) {
			SNC.ContentUnloader.unloadMetadata(grPortalPage);

            var grPortal = new GlideRecord("sys_portal");
            grPortal.addQuery("page", portalPageSysId);
            grPortal.query();
            while (grPortal.next()) {
				SNC.ContentUnloader.unloadMetadata(grPortal);
			}
		}
		
		// Add tab's related canvas page
		var grGridCanvas = new GlideRecord("sys_grid_canvas");
		if (grGridCanvas.get(canvasPageSysId)) {
			SNC.ContentUnloader.unloadMetadata(grGridCanvas);
			
			// Add grid canvas panes related to the canvas page
			var grGridCanvasPane = new GlideRecord("sys_grid_canvas_pane");
			grGridCanvasPane.addQuery("grid_canvas", grGridCanvas.getUniqueValue());
			grGridCanvasPane.query();
			while (grGridCanvasPane.next()) {
				SNC.ContentUnloader.unloadMetadata(grGridCanvasPane);
			}
		}
	
		// Add tab
		SNC.ContentUnloader.unloadMetadata(grTabs);
	}
	
	// Add dashboard tabs relation
	SNC.ContentUnloader.unloadMetadata(grDashboardTabs);
}

// Add dashboard permissions
var grDashboardPermissions = new GlideRecord("pa_dashboards_permissions");
grDashboardPermissions.addQuery("dashboard", current.sys_id);
grDashboardPermissions.query();
while (grDashboardPermissions.next()) {
	SNC.ContentUnloader.unloadMetadata(grDashboardPermissions);
}
