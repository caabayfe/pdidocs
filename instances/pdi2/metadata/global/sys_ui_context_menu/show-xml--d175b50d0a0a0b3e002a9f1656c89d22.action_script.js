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
    var url = new GlideURL(g_list.getTableName() + '_list.do');
    url.addParam('sysparm_query', g_list.getQuery());
    url.addParam('XML','');
    var win = window.open("blank.do", "xmlview", "width=700,height=500,toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1");
	
	if(isMSIE8) {
   	    var referLink = document.createElement('a');
        referLink.href = url.getURL();
	    referLink.target="xmlview";
        document.body.appendChild(referLink);
        referLink.click();
	} else 
	    win.location.href = url.getURL();
}
