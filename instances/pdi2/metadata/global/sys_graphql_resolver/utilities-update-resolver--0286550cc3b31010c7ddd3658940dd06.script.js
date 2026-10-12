(function process(env) {
	
	function updateHeaderRecord(id) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', 'chrome_header');
		gr.addQuery('page', id);
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) {
			var header = JSON.parse(gr.getValue('value'));
			header.privatePage.notificationsEnabled = env.getArguments().notifications;
			header.privatePage.searchEnabled = env.getArguments().globalSearch;
			gr.setValue('value', JSON.stringify(header));
			return gr.update();
		}		
		return false;		
	}
	
	function updateSearchRecord(id, value) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
		gr.addQuery('name', 'globalSearchDataConfigId');
		gr.addQuery('page', id);
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) {
			gr.value = value;
			return gr.update();
		} else {
			gr.initialize();
			gr.page = id;
			gr.type = 'string';
			gr.value = value;
			gr.insert();
		}		
			
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
		
    var header = updateHeaderRecord(env.getArguments().sysId);
	var search = updateSearchRecord(env.getArguments().sysId, env.getArguments().selectedSearchSource);

  return {
	headerSysId: header,
	searchSysId: search,
	notifications: env.getArguments().notifications,
	globalSearch: env.getArguments().globalSearch,
	selectedSearchSource: env.getArguments().selectedSearchSource,
	searchSources: getSearchSources()
   };

})(env);
