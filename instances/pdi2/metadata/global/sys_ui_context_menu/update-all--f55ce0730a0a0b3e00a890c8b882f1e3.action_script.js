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
   var url = new GlideURL(g_list.tableName + '_update.do');
   url.addParam('sys_action', 'sysverb_multiple_update');
   url.addParam('sysparm_multiple', 'true');
   url.addParam('sysparm_nostack', 'yes');
   url.addParam('sysparm_query', g_list.getQuery({fixed: true}));
   url.addParam('sysparm_view', g_list.getView());
   
   var msg = ['Update the entire list?', 'records', 'Number of records is not available'];
   var answer = new GwtMessage().getMessages(msg);
   
   var promptMsg = answer['Update the entire list?'];
   if (g_list.omitCount)
      promptMsg += " (" + answer['Number of records is not available'] + ")";
   else
      promptMsg += " (" + g_list.grandTotalRows + " " + answer['records'] + ")";
   if (!confirm(promptMsg))
      return;
   
   g_navigation.open(url.getURL());
}
