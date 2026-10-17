/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
 
function editGroupFilters() {
   // redirect to a list so user can edit their group's filters
   var url = new GlideURL("sys_filter_list.do");
   url.addEncodedString("sysparm_query=table%3D" 
						+ g_list.tableName 
						+ "^groupISNOTEMPTY"
					    + "^GROUPBYgroup");
   self.location = url.getURL();
}
