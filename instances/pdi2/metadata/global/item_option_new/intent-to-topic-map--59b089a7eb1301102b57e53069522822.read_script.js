var cpUtils = new global.CPIARUtils();
var intentList = cpUtils.getIntentList(current.getValue("sys_id"));
var topicList = cpUtils.getTopicList();

answer = JSON.stringify({
	tableName: "sys_cs_auto_resolution_intent_topic_map",
    query: "ar_configuration="+current.getValue("sys_id"),
	hideHeader: false,
	hidePagination: true,
	viewName: "iar_admin_wizard_view",
	disallowSelectingRecords: false,
	hideQuickEdit:true,
	title: gs.getMessage("Intent to topic map"),
	hideListActions: false,
	hideFilterButton: true,
	hideMenuButton: true,
	hideRefresh: false,
	hideLinks: false,
	fieldValue: current.getValue("sys_id"),
	header: gs.getMessage("Intent to topic map"),
	sub_header: gs.getMessage("Add new Intent to topic map record"),
	intentList: intentList,
	topicList: topicList
});
