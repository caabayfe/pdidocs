answer = JSON.stringify({
	tableName: "sys_cs_auto_resolution_response_channel",
    query: "configuration="+current.getValue("sys_id"),
	hideHeader: false,
	hidePagination: true,
	viewName: "iar_admin_wizard_view",
	disallowSelectingRecords: true,
	hideQuickEdit:true,
	title: gs.getMessage("Response Channels"),
	hideListActions: false,
	hideFilterButton: true,
	hideMenuButton: true,
	hideRefresh: true,
	hideLinks: false
});
