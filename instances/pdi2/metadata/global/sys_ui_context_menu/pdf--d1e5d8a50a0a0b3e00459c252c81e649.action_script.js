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
    var sysparm_query = g_list.getQuery({
        all: true
    });
    var sysparm_view = g_list.view;

    var sysparm_locale_txt_match = g_list.getSubmitValue('sysparm_locale_txt_match');
    var gdw = new GlideModal("export_to_pdf", false, 400);
    gdw.setTitle(getMessage("Export to PDF"));
    gdw.setPreference("sysparm_table_name", g_list.tableName);
    gdw.setPreference("sysparm_query", sysparm_query);
    gdw.setPreference("sysparm_view", sysparm_view);
    gdw.setPreference("sysparm_rows", sysparm_rows);
    gdw.setPreference("sysparm_isList", true);
    gdw.setPreference("sysparm_locale_txt_match", sysparm_locale_txt_match);
    gdw.render();
}
