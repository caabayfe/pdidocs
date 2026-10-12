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
   // Ask the server for the query term we need to add for the list to show records past this time
   var ajax = new GlideAjax("RowFieldQueryTerm");
   ajax.addParam('table', g_list.tableName);
   ajax.addParam('field_name', g_fieldName);
   ajax.addParam('sys_id', g_sysId);
   ajax.addParam('oper', '>=');
   ajax.getXML(rowAndFieldQueryTermResponse, "", g_list.listID);
}

function rowAndFieldQueryTermResponse(response, listID) {
   if (!response || !response.responseXML)
      return;

   var items = response.responseXML.getElementsByTagName("item");
   var item = items[0];
   if (!item)
      return;

   var term = item.getAttribute("term");
   var list = GlideList2.get(listID);
   list.addFilter(term);
   list.refresh(1);
}
