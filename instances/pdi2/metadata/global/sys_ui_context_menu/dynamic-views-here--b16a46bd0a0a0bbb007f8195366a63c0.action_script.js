/** 
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
function changeView(view) {
   var url = new GlideURL(g_list.getTableName() + '_list.do');
   url.addParam('sysparm_view', view);
   url.addParam('sysparm_userpref.' + g_list.getTableName() + '_list.view', view);
   url.addParam('sysparm_userpref.' + g_list.getTableName() + '.view', view);
   url.addParam('sysparm_query', g_list.getQuery({groupby: true}));
   url.addParam('sysparm_fixed_query', g_list.getFixedQuery());
   window.location = url.getURL();
}
