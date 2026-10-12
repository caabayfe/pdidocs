function showSectionTypeSelectionDialog() {
	
	var tableName = self.gel('sys_target').value;
	var itemTableQuery;
	var glideUrl;
	var glideDialog;
	
	if (tableName === 'sys_sg_form_segment' || _doesTableExtend(tableName, 'sys_sg_form_segment')) {
		itemTableQuery = new GlideURL(tableName + '.do');
		itemTableQuery.addParam('sys_id', -1);
		glideUrl = new GlideURL('nav_to.do');
		glideUrl.addParam('uri', itemTableQuery.getURL());
		top.window.location = glideUrl.getURL();
	} else {
		// Initialize and open the Dialog Window
		glideDialog = new GlideDialogWindow('item_type_selection_dialog');
		glideDialog.setTitle('Select form segment type');
		glideDialog.setPreference('tableName', 'sys_sg_form_segment');
		glideDialog.setPreference('includeBaseTable', true);
		glideDialog.setPreference('onPromptComplete', _afterUserSelectSection);
		glideDialog.render();
	}
	
	function _afterUserSelectSection(userSelectedSectionType) {
		var currentUrl = new URL(top.window.location);
		var sectionTableUrl = new GlideURL(userSelectedSectionType + '.do');
		sectionTableUrl.addParam('sys_id', -1);
		_addParmReferringIfExist(currentUrl, sectionTableUrl);
		sectionTableUrl.addParam('sysparm_query', 'form=' + g_form.getUniqueValue());
		top.window.location = _getFullURL(currentUrl, sectionTableUrl);
	}
	
	function _getFullURL(currentUrl, sectionTableUrl) {
		var fullUrl;
		
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return sectionTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', sectionTableUrl.getURL());
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
