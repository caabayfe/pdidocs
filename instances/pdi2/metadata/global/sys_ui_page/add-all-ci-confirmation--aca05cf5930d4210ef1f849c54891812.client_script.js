function ok() {
    GlideModal.get().destroy();
    viewProgress();
}

function viewProgress() {
    showLoadingIcon();
	var g_list = GlideList2.get(NOW.task_add_affected.TABLE_NAME);

	var gajax = new window.parent.GlideAjax("AssociateCIToTask");
	gajax.addParam("sysparm_name","addAll");
	gajax.addParam("sysparm_id", NOW.task_add_affected.TASK_ID);
	gajax.addParam("sysparm_query", g_list.getQuery());
	gajax.addParam("sysparm_fixed_query", g_list.getFixedQuery());
	gajax.addParam("sysparm_tableName", g_list.tableName);
	gajax.addParam("sysparm_add_to_table", NOW.task_add_affected.ADD_TO_TABLE);
	gajax.getXMLAnswer(closeWindow);
}

function cancel() {
    GlideModal.get().destroy();
}
