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
   var url = new GlideURL('slushbucket.do');
   url.addParam('sysparm_view', g_list.getView());
   url.addParam('sysparm_referring_url', g_list.getReferringURL());
   url.addParam('sysparm_form', 'list');
   url.addParam('sysparm_user_list', g_list.isUserList().toString());
   url.addParam('sysparm_list', g_list.tableName);
   url.addParam('sysparm_collection', g_list.getParentTable());
   var rel = g_list.getSubmitValue('sysparm_collection_relationship');
   if (rel)
      url.addParam('sysparm_collection_relationship' , rel);
   
   window.location = url.getURL();
}
