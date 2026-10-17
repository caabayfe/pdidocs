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
 
runContextAction();

function runContextAction() {
   var g = new GlideDialogWindow('Metric List Control');
	g.setTitle('Personalize Metric Control'+ ' (' + g_fieldLabel + ')');
	g.setPreference("sysparm_list", g_list.tableName);
	g.setPreference("sysparm_list_element", g_fieldName);
	g.setDialog('personalize_metric_list_control');
	g.setSize(500, 400);
	g.render();
}
