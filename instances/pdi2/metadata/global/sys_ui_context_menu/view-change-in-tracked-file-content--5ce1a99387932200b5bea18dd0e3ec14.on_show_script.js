/**
 * This client-side script is used to dynamically change the context menu before it is displayed.
 * It is called before showing the context menu if the Run onShow script flag is checked.
 *
 * The following variables are available to the script:
 *    'g_menu' the context menu that is about to be shown
 *    'g_item' the current context menu item
 *    'g_list' the GlideList2 that the script is running against (only valid for List context menus)
 *    'g_fieldName' the name of the field that the context menu is running against (only valid for List context menus)
 *    'g_fieldLabel' the label of the field that the context menu is running against (only valid for List context menus)
 *    'g_sysId' the sys_id of the row or form that the script is running against
 */


//The menu show only on changes that occured on tracked config files, and only on CI_MODIFIED type.
(function() {
	g_menu.setDisabled(g_item);
	var gr = new GlideRecord("svc_model_checkpoint_attr");
	gr.get(g_sysId);
	
	if (gr.getValue("name") !== "FILE_MODIFIED")
		return;
		
	
	var annotation = gr.getValue("annotation");
	try {
		annotation = JSON.parse(annotation);
	} catch(e) {
		return;
	}
	
	if (!annotation || annotation.className !== "cmdb_ci_config_file_tracked")
		return;
	
	g_menu.setEnabled(g_item);
})();
