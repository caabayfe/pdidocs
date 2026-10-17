updateSysRefListViewNA();

function updateSysRefListViewNA() {
	var view = new GlideRecord('sys_ui_view');
	view.addQuery('name', 'sys_ref_list');
	view.setLimit(1);
	view.query();
	if(view.next()) {
		var listSysId = checkAndCreateListView('sys_notification_action', view.sys_id);

		var pos = updateRefListView("name", 0, listSysId);
		pos = updateRefListView("sys_class_name", pos+1, listSysId);
		updateRefListView("sys_created_by", pos+1, listSysId);

		// content ref
		listSysId = checkAndCreateListView('sys_notification_content', view.sys_id);

		pos = updateRefListView("name", 0, listSysId);
		pos = updateRefListView("sys_class_name", pos+1, listSysId);
	}
}

function checkAndCreateListView(tableName, viewId) {
	var listSysId = "";
	var list = new GlideRecord('sys_ui_list');
	list.addQuery('view', viewId);
	list.addQuery('name', tableName);
	list.setLimit(1);
	list.query();
	if(list.next()) {
		listSysId = list.sys_id;
	} else {
		list = new GlideRecord('sys_ui_list');
		list.initialize();
		list.name = tableName;
		list.view = viewId;
		listSysId = list.insert();
	}
	return listSysId;
}

function updateRefListView(colName, position, listId) {
	var listCol = new GlideRecord('sys_ui_list_element');
	listCol.addQuery('list_id', listId);
	listCol.addQuery('element', colName);
	listCol.setLimit(1);
	listCol.query();

	if(listCol.next())
		return listCol.position;

	listCol = new GlideRecord('sys_ui_list_element');
	listCol.initialize();
	listCol.element = colName;
	listCol.position = position;
	listCol.list_id = listId;
	listCol.insert();

	return position;
}
