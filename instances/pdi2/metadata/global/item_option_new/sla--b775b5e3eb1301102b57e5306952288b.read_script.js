var cpUtils = new global.CPIARUtils();
var listEmailItems = cpUtils.getEmailNotificationList(current.getValue("target_table_name"));
var listSMSItems = cpUtils.getSMSNotificationList(current.getValue("target_table_name"));
var isSMSActive = cpUtils.isSMSActive();

answer = JSON.stringify({
	tableName: "sys_cs_auto_resolution_reminder",
    query: "configuration="+current.getValue("sys_id"),
	hideHeader: false,
	hidePagination: true,
	viewName: "iar_admin_wizard_view",
	disallowSelectingRecords: false,
	hideQuickEdit:true,
	title: gs.getMessage("SLA"),
	hideListActions: false,
	hideFilterButton: true,
	hideMenuButton: true,
	hideRefresh: false,
	hideLinks: false,
	header: gs.getMessage("SLA"),
	sub_header: gs.getMessage("Add new SLA record"),
	fieldName: "configuration",
	fieldValue: current.getValue("sys_id"),
	listEmailItems: listEmailItems,
	listSMSItems: listSMSItems,
	isSMSActive: isSMSActive
});
