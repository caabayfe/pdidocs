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
   
   var sysparm_rows = g_list.grandTotalRows;
   var num_rows = parseInt(sysparm_rows);
   var sysparm_query = g_list.getQuery({all: true});
   var sysparm_view = g_list.view;

   var sysparm_locale_txt_match = g_list.getSubmitValue('sysparm_locale_txt_match');

   if (num_rows < g_export_warn_threshold) {
      var dialog = new GwtPollDialog(g_list.tableName, sysparm_query, sysparm_rows, sysparm_view, 'unload_pdflandscape', undefined, undefined, undefined, undefined, undefined, undefined, sysparm_locale_txt_match);
      dialog.execute();
      return;
   }
   var dialog = new GwtExportScheduleDialog(g_list.tableName, sysparm_query, sysparm_rows, sysparm_view, 'unload_pdflandscape', undefined, undefined, undefined, undefined, sysparm_locale_txt_match);
   dialog.execute();
}
