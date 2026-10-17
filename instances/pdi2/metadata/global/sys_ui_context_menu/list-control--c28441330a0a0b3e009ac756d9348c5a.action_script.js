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
   var query;
   var parentName = g_list.getParentTable();
   if (parentName) {
      // this is a related list
      var query = 'name=' + g_list.getParentTable();
      query += '^related_list=' + g_list.getRelated();
   } else
      query = "name=" + g_list.getTableName() + "^related_list=";

   var url;
   if (!g_list.isEmbedded())
      url = new GlideURL('sys_ui_list_control.do');
   else
      url = new GlideURL('sys_ui_list_control_embedded.do');

   url.addParam('sys_id', g_list.getListControlID());
   if (query)
      url.addEncodedString("&sysparm_query=" + query);

   g_navigation.open(url.getURL());
}
