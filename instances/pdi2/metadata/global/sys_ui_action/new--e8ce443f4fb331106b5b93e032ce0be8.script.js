function createNewUserCriteriaMappingFromRelatedList() {
	var currentUrl = new URL(top.window.location);
	var userCriteriaMappingTableUrl = new GlideURL('sys_sg_user_criteria_mapping.do');
	userCriteriaMappingTableUrl.addParam('sys_id', -1);
	_addParmQueryIfNeeded(userCriteriaMappingTableUrl);
	top.window.location = _getFullURL(currentUrl, userCriteriaMappingTableUrl);
	
	function _getFullURL(currentUrl, userCriteriaMappingTableUrl) {
		var fullUrl;
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return userCriteriaMappingTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', userCriteriaMappingTableUrl.getURL());
		return fullUrl.getURL();
	}
	
	function _addParmQueryIfNeeded(userCriteriaMappingTableQuery) {
		if (typeof g_form != 'object')
			return;
 
		userCriteriaMappingTableQuery.addParam('sysparm_query', _getRelatedLinkQuery());
	}
	
	function _getRelatedLinkQuery() {
		var tableName = g_form.getTableName();
		return 'mobile_entity_table' + '=' + tableName +
			'^' + 'mobile_entity' + '=' + g_form.getUniqueValue();
	}

}
