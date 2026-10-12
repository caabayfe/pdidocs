function showNavigationTypeSelectionDialog() {
	var tableName = self.gel('sys_target').value;
	var itemTableQuery;
	var glideUrl;
	var glideDialog;
	// Navigation type selection dialog is not available if tables extends sys_sg_navigation_tab and new button located in List view.
	if (_doesTableExtend(tableName, 'sys_sg_navigation_tab')
		&& typeof g_form() === 'undefined') {
		itemTableQuery = new GlideURL(tableName + '.do');
		itemTableQuery.addParam('sys_id', -1);
		glideUrl = new GlideURL('nav_to.do');
		glideUrl.addParam('uri', itemTableQuery.getURL());
		top.window.location = glideUrl.getURL();
	} else {
		// Initialize and open the Dialog Window
		glideDialog = new GlideDialogWindow('item_type_selection_dialog');
		glideDialog.setTitle('Select Navigation Type');
		glideDialog.setPreference('tableName', 'sys_sg_navigation_tab');
		glideDialog.setPreference('onPromptComplete', _afterUserSelectNavigationType);
		glideDialog.setPreference('currentFormTable', tableName);
		glideDialog.render();
	}
	
	function _afterUserSelectNavigationType(userSelectedTabType) {
		var currentUrl = new URL(top.window.location);
		var navigationTableUrl = new GlideURL(userSelectedTabType + '.do');
		navigationTableUrl.addParam('sys_id', -1);
		_addParmReferringIfExist(currentUrl, navigationTableUrl);		
		top.window.location = _getFullURL(currentUrl, navigationTableUrl);
	}
	
	function _getFullURL(currentUrl, navigationTableUrl) {
		var fullUrl;
		// Add navigation bar if it was used previously.
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return navigationTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', navigationTableUrl.getURL());
		return fullUrl.getURL();
	}
	
	// In case when you need auto redirection to calling place, after creation of new element.
	function _addParmReferringIfExist(url, itemTableQuery) {
		var parmView = url.searchParams.get('sysparm_view');
		var refUrl;
		var target;
		var targetValue;
		if (!parmView || parmView !== 'sys_ref_list')
			return;
	
		itemTableQuery.addParam('sysparm_view', parmView);
		refUrl = new GlideURL(url.pathname.substring(1));
		target = url.searchParams.get('sysparm_target');
		if (target)
			refUrl.addParam('sysparm_target', target);
	
		targetValue = url.searchParams.get('sysparm_target_value');
		if (targetValue)
			refUrl.addParam('sysparm_target_value', targetValue);
	
		itemTableQuery.addParam('sysparm_referring_url', refUrl.getURL());
	}
	
	// checking if the current table extends sys_sg_navigation_tab. if yes we don't need to create the Dialog, just openning the relevant form 
	function _doesTableExtend(tableName, baseTableName) {
		var doesExtends;
		var ga = new GlideAjax('TableExtensionsProcessor');// this is the script include
		ga.addParam('sysparm_name', 'doesTableExtend'); // this is the function within the script include
		ga.addParam('sysparm_table_name', tableName);
		ga.addParam('sysparam_base_table_name', baseTableName);
		ga.getXMLWait();
		doesExtends = ga.getAnswer();
		return doesExtends === 'true';
	}
}
