/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
runContextAction();

function runContextAction() {
	var query = g_list.getQuery({ orderby: true, fixed: true });
	if (g_list.getRelated())
		query = g_list.getRelatedQuery() + (query ? "^" + query : "");

	var url = new GlideURL('$vtb_get.do');
	url.addParam('sysparm_action', 'board_show');
	url.addParam('sysparm_field', g_fieldName);
	url.addParam('sysparm_table', g_list.getTableName());
	url.addParam('sysparm_query', query);
	g_navigation.open(url.getURL());
}
