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
   var g = new GlideDialogWindow('Calculations');
   g.setTitle(g_fieldLabel + ' (calculations)');
   g.setDialog('personalize_aggregate');
   g.setPreference("sysparm_list", g_list.tableName);
   g.setPreference("sysparm_list_element", g_fieldName);
   
   var view = g_list.view;
   if (!view)
      view = '';
   g.setPreference("sysparm_list_view", view);
   
   var collection = g_list.getParentTable();
   if (!collection)
      collection = '';
   g.setPreference("sysparm_list_parent", collection);
   
   var rel = g_list.getSubmitValue('sysparm_collection_relationship');
   if (!rel)
      rel = '';
   g.setPreference("sysparm_list_relationship", rel);
   g.render();
}
