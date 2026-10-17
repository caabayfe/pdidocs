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
   var url = new GlideURL('/' + g_list.getTableName() + '_list.do');
   url.addParam('sysparm_referring_url', g_list.getReferringURL());
   url.addParam('sysparm_query', g_list.getQuery({fixed: true}));
   url.addParam('sys_action', 'java:UnloadApplicationData');
   url.addParam('sys_target', g_list.getTableName());
   g_navigation.open(url.getURL());
}
