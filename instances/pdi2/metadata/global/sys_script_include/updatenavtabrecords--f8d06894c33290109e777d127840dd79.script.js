var UpdateNavTabRecords = Class.create();
UpdateNavTabRecords.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'UpdateNavTabRecords',
	
	updateRecords: function () {
		var searchProfile = this.getParameter('sysparm_search_profile');
		var searchAppConfig = this.getParameter('sysparm_search_config');
		
		//Clear NavTab records for given Search Profile
		var navTabGr = new GlideRecord('sys_search_filter');
		navTabGr.addQuery('search_context_config', searchAppConfig);
		navTabGr.query();
		navTabGr.deleteMultiple();
		
		//Fetch Ais Data Source Associated with the Search Profile
		var searchSourceGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
		searchSourceGr.addQuery('profile', searchProfile);
		searchSourceGr.query();
		
		
		var order = 100;
		//For each search source in Search Profile -> Create new GR in NavTab 
		while(searchSourceGr.next()) {
						
			//Create newRecord in navTab with
			navTabGr.initialize();
			navTabGr.name = searchSourceGr.search_source.name;
			
			var sourceTable = searchSourceGr.search_source.datasource.source;
			navTabGr.label = ((new GlideRecord(sourceTable)).getClassDisplayValue());
			navTabGr.order = order;
			navTabGr.search_context_config = searchAppConfig;
			navTabGr.ais_search_source = searchSourceGr.search_source;
			navTabGr.insert();
			order += 100;
		}
	}
});
