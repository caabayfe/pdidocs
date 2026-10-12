// CONSTANTS
var DB_VIEW = "sp_page_widgets";
var WIDGET_SYS_ID = "wid_sys_id";
var PAGE_SYS_ID = "pg_sys_id";
var PORTAL_ANALYZER = "sp_portal_analyzer";
var WIDGET_NAME = "wid_name";
var PAGE_ID = "pg_id";
var CATEGORIES = ["Uncategorized", "OOTB", "Cloned", "New", "Customized"]; // order is key here

var util = new PortalAnalyzerUtils();
var pageViews = {}; // to hold page-view counts against sys ID to avoid multiple getPageViewCount invocation
var userViews = {}; // to hold user counts against sys ID to avoid multiple getUserCountByPage invocation
var widgetCategory = {}; // to hold widget customization category 
var widgets;
var pa = null;
var widgetSysID, pageSysID, category;

try {
    var paT = new GlideRecord(PORTAL_ANALYZER); // clean portal analyzer table before inserting latest records
    paT.deleteMultiple();
    var widgetCustomization = new SPDiagnosticsDriver();
    var gr = new GlideRecord(DB_VIEW); // database view call
    gr.query();
    while (gr.next()) {
        pa = new GlideRecord(PORTAL_ANALYZER);
        pa.initialize();
        widgetSysID = gr.getValue(WIDGET_SYS_ID);
        pageSysID = gr.getValue(PAGE_SYS_ID);
        widgets = [];
        widgets.push(widgetSysID);
        if (!widgetCategory.hasOwnProperty(widgetSysID)) {
            widgets = widgetCustomization.categorize(JSON.stringify(widgets));
            widgets = JSON.parse(widgets); // Diagnostic Driver categorize API returns a string
            widgetCategory[widgetSysID] = CATEGORIES[widgets[widgetSysID]["widgetCustDetails"]["category"]];
        }
        if (!pageViews.hasOwnProperty(pageSysID))
            pageViews[pageSysID] = util.getPageViewCount(pageSysID);
        if (!userViews.hasOwnProperty(pageSysID))
            userViews[pageSysID] = util.getUserCountByPage(pageSysID);
        category = widgetCategory[widgetSysID];
        pa.status = category; // start updating pa glide record
        pa.widget = widgetSysID; // widget is a reference and we need sys ID for reference field to work
	pa.widget_id = widgetSysID; // widget_id is a string and we need this for export to excel/csv
        pa.page = pageSysID; // page is a reference and we need sys ID for reference field to work
	pa.page_id = pageSysID; // page_id is a string and we need this for export to excel/csv
        pa.page_views = pageViews[pageSysID];
        pa.users = userViews[pageSysID];
        pa.insert();
    }
} catch (error) {
    gs.error("Exception in --Portal Analyzer-- schedule job");
    gs.error("Error : " + error);
}
