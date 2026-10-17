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
	var dmdelete = new GlideRecord('sys_dm_delete');
	dmdelete.initialize();
	dmdelete.table = g_list.getTableName();
    dmdelete.condition = g_list.getQuery({fixed: true});
    dmdelete.insert(function(gr, sysId) {
		// this needs the leading slash in order to resolve for both UI16 and UI26
		var gUrl = new GlideURL('/sys_dm_delete.do');
		gUrl.addParam('sys_id', sysId);
		g_navigation.open(gUrl.getURL());
	});
}
