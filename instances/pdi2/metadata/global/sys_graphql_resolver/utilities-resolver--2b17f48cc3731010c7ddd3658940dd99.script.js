(function process(env) {
	
	function getRecord(id, type) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', type);
		gr.addQuery('page', id);
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) { 
			return gr;
		}		
		return false;		
	}
	
	function getSearchSources() {
		var gr = new GlideRecordSecure('sys_search_context_config');
		var result = [];
		gr.query();
		while (gr.next()) {
			result.push({id: gr.getValue('sys_id'), label: gr.getValue('name')});
		}		
		
		return result; 
	}
		
    var headerRecord = getRecord(env.getArguments().sysId, 'chrome_header');
	var searchRecord = getRecord(env.getArguments().sysId, 'globalSearchDataConfigId');
    var header = JSON.parse(headerRecord.getValue('value'));

  return {
	headerSysId: headerRecord.getValue('sys_id'),
	searchSysId: (searchRecord) ? searchRecord.getValue('sys_id'): "",
	notifications: header.privatePage.notificationsEnabled,
	globalSearch: header.privatePage.searchEnabled,
	selectedSearchSource: (searchRecord) ? searchRecord.value : "",
	searchSources: getSearchSources()
   };

})(env);
