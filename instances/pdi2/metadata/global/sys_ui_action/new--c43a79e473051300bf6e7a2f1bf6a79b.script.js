function showScreenTypeSelectionDialog() {
	var tableName = gel('sys_target').value;
	var itemTableQuery;
	var glideUrl;
	var glideDialog;
	// screen type selection dialog is not available if tables extends sys_sg_screen and new button located in List view.
	if (_doesTableExtend(tableName, 'sys_sg_screen')
		&& typeof g_form === 'undefined') {
		itemTableQuery = new GlideURL(tableName + '.do');
		itemTableQuery.addParam('sys_id', -1);
		_addParmQueryIfNeeded(itemTableQuery, tableName);
		glideUrl = new GlideURL('nav_to.do');
		glideUrl.addParam('uri', itemTableQuery.getURL());
		top.window.location = glideUrl.getURL();
	} else {
		// Initialize and open the Dialog Window
		glideDialog = new GlideDialogWindow('item_type_selection_dialog');
		glideDialog.setTitle('Select Screen Type');
		glideDialog.setPreference('tableName', 'sys_sg_screen');
		glideDialog.setPreference('excludeTables', ['sys_sg_action_screen']);
		glideDialog.setPreference('onPromptComplete', _afterUserSelectScreenType);
		glideDialog.render();
	}
	
	function _afterUserSelectScreenType(userSelectedTabType) {
		var currentUrl = new URL(top.window.location);
		var screenTableUrl = new GlideURL(userSelectedTabType + '.do');
		screenTableUrl.addParam('sys_id', -1);
		_addParmReferringIfExist(currentUrl, screenTableUrl);
		_addParmQueryIfNeeded(screenTableUrl, userSelectedTabType);
		top.window.location = _getFullURL(currentUrl, screenTableUrl);
	}
	
	function _getFullURL(currentUrl, screenTableUrl) {
		var fullUrl;
		// Add navigation bar if it was used previously.
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return screenTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', screenTableUrl.getURL());
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
	
	// In case of Related List.
	function _addParmQueryIfNeeded(itemTableQuery, screenType) {
		var paramQuery = '';
		
		if(screenType === 'sys_sg_form_screen')
			paramQuery = _addUseViewConfigParameter();
			
		if (typeof g_form === 'undefined') {
			_addParamQuery(itemTableQuery, paramQuery);
			return;
		}
	
		if(paramQuery)
			paramQuery = paramQuery + '^';
		
		paramQuery = paramQuery + _getRelatedLinkQuery();
		
		_addParamQuery(itemTableQuery, paramQuery);
	}
	
	function _addParamQuery(itemTableQuery, paramQuery) {
		if(paramQuery)
			itemTableQuery.addParam('sysparm_query', paramQuery);
	}
	
	function _getRelatedLinkQuery() {
		return 'parent_table' + '=' + g_form.getTableName() +
			'^' + 'parent' + '=' + g_form.getUniqueValue();
	}
	
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
	
	function _addUseViewConfigParameter() {
		return 'use_view_config=true';
	}	
}
