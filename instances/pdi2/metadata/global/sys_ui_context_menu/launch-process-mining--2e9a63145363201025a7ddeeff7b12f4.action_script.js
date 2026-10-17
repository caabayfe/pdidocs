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

createModelDefAndRedirect();

function createModelDefAndRedirect() {
    var recSysId = "-1";
    var table = g_list.getTableName();
    var query = g_list.getQuery({
        orderby: true,
        fixed: true
    });
    var ga = new GlideAjax('global.ProminUtilsAJAX'); // HelloWorld is the script include class 
    ga.addParam('sysparm_name', 'createModelDefFromList'); // helloWorld is the script include method 
    ga.addParam('sysparm_table', table);
    ga.addParam('sysparm_query', query);
    ga.getXMLWait();
    var response = ga.getAnswer();
    if (typeof(response) == "string" && response.length >= 32) {
        recSysId = response;
    }

    var url = new GlideURL('promin_project.do');
    url.addParam('sys_id', recSysId);
    if (recSysId == "-1") {
        g_navigation.open("now/experience/promin/promin_project/-1/set-objectives", "_blank");
    }
    g_navigation.open("/now/experience/promin/promin_project/" + recSysId + "/overview", "_blank");
}
