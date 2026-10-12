/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
function showTable(table) {
    var url = new GlideURL('sys_db_object.do');
    url.addParam('sys_id', table);
    url.addParam('sysparm_refkey', 'name');
    url.addParam('sysparm_domain_restore', 'false');
    url.addParam('sysparm_referring_url', g_list.getReferringURL());
    
	  g_navigation.open(url.getURL());
}
