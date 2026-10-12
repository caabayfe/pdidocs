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
	var url = new GlideURL('import_template_upload.do');
	var referringUrl = g_list.getReferringURL();
	url.addParam('sysparm_referring_url', referringUrl);
	url.addParam('sysparm_target', g_list.getTableName());
	
	// add values needed for creating a template		
	url.addParam('sysparm_rows', g_list.grandTotalRows);
	url.addParam('sysparm_view', g_list.view);
	
	var tinyQuery = "sysparm_tiny=";
	var tinyIndex = referringUrl.indexOf(tinyQuery);
	if (tinyIndex == -1)// TinyURL is not used in this List
		url.addParam('sysparm_query', g_list.getQuery({orderby: true, fixed: true}));
	else { //Let's use the TinyURL provided
		var tinyUrlId = referringUrl.substring(tinyIndex + tinyQuery.length);
		url.addParam('sysparm_tiny', tinyUrlId);
	}
	
	window.location = url.getURL();
}
