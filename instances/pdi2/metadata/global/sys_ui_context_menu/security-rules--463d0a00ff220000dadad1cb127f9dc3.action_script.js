/**
 * Script executed on the Client for this menu action
 *
 * The following variables are available to the script:
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 *    'rowSysId' is also set to the sys_id of the row to support legacy actions, but g_sysId is preferred
 */
function showSecurityRules(tableName) {
   var tableDef = Table.get(tableName);
   var tables = tableDef.getTables();
   var query = 'name=*^ORnameSTARTSWITH*.';
   for (var i = 0;i < tables.length;i++)
        query += '^ORname=' + tables[i] + '^ORnameSTARTSWITH' + tables[i] + '.';

   var url = new GlideURL('sys_security_acl_list.do');
   url.addEncodedString('sysparm_query=' + query);
   window.location = url.getURL();
}
