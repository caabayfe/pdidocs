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

   // open the designer with custom_config param
   var url = new GlideURL('sys_report_template.do');
   url.addParam('sysparm_type', 'step_line');
   url.addParam('sysparm_table', g_list.getTableName());
   url.addParam('sysparm_source_type', 'metricbase');
   url.addParam('sysparm_from_list', 'true');
   url.addParam('sysparm_chart_size', 'large');
   url.addParam('sysparm_manual_labor', 'true');
   url.addParam('sysparm_metric_field',  g_fieldName.slice(8));
   url.addParam('sysparm_query', g_list.getQuery({orderby: true, fixed: true}));

   window.location = url.getURL();
}
