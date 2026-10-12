function createNewDescriptiveElementFromRelatedList() {
	var currentUrl = new URL(top.window.location);
	var descriptiveElementTableUrl = new GlideURL('sys_sg_descriptive_element.do');
	descriptiveElementTableUrl.addParam('sys_id', -1);
	_addParmQueryIfNeeded(descriptiveElementTableUrl);
	top.window.location = _getFullURL(currentUrl, descriptiveElementTableUrl);
	
	function _getFullURL(currentUrl, descriptiveElementTableUrl) {
		var fullUrl;
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return descriptiveElementTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', descriptiveElementTableUrl.getURL());
		return fullUrl.getURL();
	}
	
	function _addParmQueryIfNeeded(descriptiveElementTableQuery) {
		if (typeof g_form != 'object')
			return;
 
		descriptiveElementTableQuery.addParam('sysparm_query', _getRelatedLinkQuery());
	}
	
	function _getRelatedLinkQuery() {
		var tableName = g_form.getTableName();
		return 'parent_table' + '=' + tableName +
			'^' + 'parent' + '=' + g_form.getUniqueValue();
	}
}
