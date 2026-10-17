/**
  * Script executed on the Client for this menu action
  *
  * The following variables are available to the script:
  *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
  *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
  *    'g_sysId' the sys_id of the row or form that the script is running against
  *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
  */
 function copyURL(uri) {
      copyRowToClipboard(uri, g_list.tableName, g_sysId, g_list.view); 
 }

 function copyRowToClipboard(base, ref, sysId, view) {
	var url = base + "nav_to.do?uri=" + ref + ".do?sys_id=" + sysId;
	if (view)
		url += "%26sysparm_view=" + view;

	copyToClipboard(url);
}
