var mlLicenseId = SNC.UsageAnalyticsScriptUtils.getLicenseIdForApp('com.glide.platform_ml');
var mlUsageReportTitle = 'Prediction Usage';
var dashboardName = mlUsageReportTitle;

if (JSUtil.notNil(mlLicenseId) && !mlReportExists(mlUsageReportTitle)) {
	var report = new GlideRecord('sys_report');
    report.title = mlUsageReportTitle;
    report.table = 'usageanalytics_count';                      
    report.field = 'table_name'; // group by
    report.type = 'line';                 
	report.sumfield = 'count';
    report.aggregate = 'SUM';
    report.trend_field = 'sys_created_on';
    report.interval = 'month';
    report.y_axis_title = 'Count';
	
	var purchasedCountCfgSysId = getPurchasedCountCfgSysId(mlLicenseId);
	var allocCountCfgSysId = getAllocCountCfgSysId();
                       
    var filter = 'sys_created_on<javascript:gs.beginningOfThisMonth()^sys_created_on>=javascript:gs.beginningOfLast12Months()';
	filter += '^count_cfg=' + purchasedCountCfgSysId + '^ORcount_cfg=' + allocCountCfgSysId;
	filter += '^EQ^GROUPBYtable_name^TRENDBYsys_created_on,month';

    report.filter = filter;               
                       
    report.user = 'GLOBAL';
    report.roles = 'ml_admin, ml_report_user';
	
    var reportSysid = report.insert();
    addReportToDashBoard(reportSysid, mlUsageReportTitle, dashboardName);
}

function addReportToDashBoard(reportSysid, mlUsageReportTitle, dashboardName) {			
	var dashboardInfo = getDashboardInfo(dashboardName);
	if (JSUtil.nil(dashboardInfo)) 
		return;	
	
	var portalSectionSysid = addPortalSection(dashboardInfo.portalPageSysid);
	if (JSUtil.nil(portalSectionSysid)) 
		return;
	
	addPortalPreference('title', mlUsageReportTitle, portalSectionSysid);	
	addPortalPreference('sys_id', reportSysid, portalSectionSysid);
	addPortalPreference('renderer', 'com.glide.ui.portal.RenderReport', portalSectionSysid);	
	
	addGridCanvasPane(dashboardInfo.gridCanvasSysid, portalSectionSysid);
}

function getDashboardInfo(dashboardName) {
	var pa_dashboards_gr = new GlideRecord('pa_dashboards');
	pa_dashboards_gr.addQuery('name', dashboardName);
	pa_dashboards_gr.query();
	if (!pa_dashboards_gr.next())
		return '';	

	var pa_m2m_dashboard_tabs_gr = new GlideRecord('pa_m2m_dashboard_tabs');
	pa_m2m_dashboard_tabs_gr.addQuery('dashboard', pa_dashboards_gr.sys_id.toString());
	pa_m2m_dashboard_tabs_gr.query();
	if (!pa_m2m_dashboard_tabs_gr.next())
		return '';
	
	var pa_tabs_gr = new GlideRecord('pa_tabs');
	pa_tabs_gr.addQuery('sys_id', pa_m2m_dashboard_tabs_gr.tab.toString());
	pa_tabs_gr.query();
	if (!pa_tabs_gr.next())
		return '';
		
	var sys_grid_canvas_gr = new GlideRecord('sys_grid_canvas');
	sys_grid_canvas_gr.addQuery('legacy_page', pa_tabs_gr.page.toString());
	sys_grid_canvas_gr.query();
	if (!sys_grid_canvas_gr.next())
		return '';
		
	return {'portalPageSysid': pa_tabs_gr.page.toString(), 
			'gridCanvasSysid': sys_grid_canvas_gr.sys_id.toString()};	
}

function addPortalSection(portalPageSysid) {
	var sys_portal_gr = new GlideRecord('sys_portal');
	sys_portal_gr.page = portalPageSysid;	
	return sys_portal_gr.insert();
}

function addPortalPreference(prefName, prefValue, portalSectionSysid) {
	var sys_portal_preferences_gr = new GlideRecord('sys_portal_preferences');
	sys_portal_preferences_gr.name = prefName;
	sys_portal_preferences_gr.portal_section = portalSectionSysid;
	sys_portal_preferences_gr.value = prefValue;
	sys_portal_preferences_gr.insert();
}

function addGridCanvasPane(gridCanvasSysid, portalSectionSysid) {
	var sys_grid_canvas_pane_gr = new GlideRecord('sys_grid_canvas_pane');
	sys_grid_canvas_pane_gr.portal_widget = portalSectionSysid;
	sys_grid_canvas_pane_gr.grid_canvas = gridCanvasSysid;
	sys_grid_canvas_pane_gr.height=10;
	sys_grid_canvas_pane_gr.width=12;
	sys_grid_canvas_pane_gr.insert();
}

function mlReportExists(title) {
    var ga = new GlideAggregate('sys_report');
    ga.addAggregate('COUNT');
    ga.addQuery('title', title);
    ga.query();
    var count = 0;
    if (ga.next()) {
        count = ga.getAggregate('COUNT');
    }
    return (count > 0);
}

function getPurchasedCountCfgSysId(licId) {
	var gr = new GlideRecord('usageanalytics_count_cfg');
	gr.addQuery('definition_id', 'LICPURCH' + licId);
	gr.query();
	if (!gr.next())
		return "";
	return gr.getUniqueValue();
	
}

function getAllocCountCfgSysId() {
	var gr = new GlideRecord('usageanalytics_count_cfg');
	gr.addQuery('definition_id', 'DEFN1000629');
	gr.query();
	if (!gr.next())
		return "";
	return gr.getUniqueValue();
}
