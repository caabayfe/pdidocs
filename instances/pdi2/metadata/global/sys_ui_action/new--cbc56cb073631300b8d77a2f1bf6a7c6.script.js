function createNewButtonInstance() {
	var currentUrl = new URL(top.window.location);
	var itemTableUrl = new GlideURL('sys_sg_button_instance.do');
	itemTableUrl.addParam('sys_id', -1);
	_addParmReferringIfExist(currentUrl, itemTableUrl);
	_addParmQueryIfNeeded(itemTableUrl);
	top.window.location = _getFullURL(currentUrl, itemTableUrl);
	
	
	function _getFullURL(currentUrl, itemTableUrl) {
		var fullUrl;
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return itemTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', itemTableUrl.getURL());
		return fullUrl.getURL();
	}
	
	//In case when you need auto redirection to calling place, after creation of new element.
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
	function _addParmQueryIfNeeded(itemTableQuery) {
		if (typeof g_form != 'object')
			return;
	
		itemTableQuery.addParam('sysparm_query', _getRelatedLinkQuery());
	}
	
	function _getRelatedLinkQuery() {
		var table_name = g_form.getTableName();
		if(_doesTableExtend(table_name, "sys_sg_screen"))
			table_name = "sys_sg_screen";
		
		return 'parent_table' + '=' + table_name +
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
}
