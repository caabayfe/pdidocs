function createNewMasterItem() {
	var currentUrl = new URL(top.window.location);
	var itemTableUrl = new GlideURL('sys_sg_master_item.do');
	itemTableUrl.addParam('sys_id', -1);
	_addParmReferringIfExist(currentUrl, itemTableUrl);
	_addParmQuery(itemTableUrl);
	top.window.location = _getFullURL(currentUrl, itemTableUrl);
	
	
	function _getFullURL(currentUrl, itemTableUrl) {
		var fullUrl;
		// Add navigation bar if it was used previously.
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
	
	function _addParmQuery(itemTableQuery) {
		itemTableQuery.addParam('sysparm_query', _addUseViewConfigParameter());
	}
	
	function _addUseViewConfigParameter() {
		return 'use_view_config=true';
	}
}
