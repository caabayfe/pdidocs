function transform(input) {
    if (input.searchFilters.length > 2) {
		// The input is recieved as a string
		var searchFilters = input.searchFilters.match(/[0-9a-zA-Z]+/g);
		var searchFilterRecord = new GlideRecord('sys_search_filter');
		searchFilterRecord.get(searchFilters[0]);
		var searchSources = new GlideRecord('ais_search_source');
		searchSources.get(searchFilterRecord.getValue('ais_search_source'));	
		var conditionOnSearchSource = searchSources.getValue('condition');
		var indexSource = searchSources.getValue('datasource'); 
		var indexedSource = new GlideRecord('ais_datasource');
		indexedSource.get('source', indexSource);
		if(indexedSource.getValue('type').toString() === 'internal'){
			var dataToGenerateViewAllLink = {'conditionOnSearchSource' : conditionOnSearchSource , 'indexedSource': indexSource};
			return dataToGenerateViewAllLink;
		}
    }
    return [];
}
