function createNewEventFromRelatedList() {
	var currentUrl = new URL(top.window.location);
	var eventsTableUrl = new GlideURL('sys_sg_event.do');
	eventsTableUrl.addParam('sys_id', -1);
	_addParmQueryIfNeeded(eventsTableUrl);
	top.window.location = _getFullURL(currentUrl, eventsTableUrl);
	
	function _getFullURL(currentUrl, eventsTableUrl) {
		var fullUrl;
		if (!currentUrl.pathname.substring(1).startsWith('nav_to.do'))
			return eventsTableUrl.getURL();
	
		fullUrl = new GlideURL('nav_to.do');
		fullUrl.addParam('uri', eventsTableUrl.getURL());
		return fullUrl.getURL();
	}
	
	function _addParmQueryIfNeeded(eventsTableQuery) {
		if (typeof g_form != 'object')
			return;
 
		eventsTableQuery.addParam('sysparm_query', _getRelatedLinkQuery());
	}
	
	function _getRelatedLinkQuery() {
		var tableName = g_form.getTableName();
		return 'type' + '=' + _getEventTypeSysId(tableName) +
			'^' + 'source_table' + '=' + tableName +
			'^' + 'source_id' + '=' + g_form.getUniqueValue();
	}

	function _getEventTypeSysId(tableName) {
		var ON_BUTTON_CLICK_EVENT_TYPE_SYS_ID = '79c06fd5a320311098882dbf36fcda34';
		var ON_LOGIN_EVENT_TYPE_SYS_ID = '4554a173673031107b19b9770cf9223a';
		switch (tableName) {
			case 'sys_sg_button':
				return ON_BUTTON_CLICK_EVENT_TYPE_SYS_ID;
			case 'sys_sg_native_client':
				return ON_LOGIN_EVENT_TYPE_SYS_ID;
			default:
				return null;
		}
	}
}
