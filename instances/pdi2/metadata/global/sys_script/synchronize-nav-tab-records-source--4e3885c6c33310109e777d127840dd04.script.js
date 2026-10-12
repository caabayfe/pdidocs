(function executeRule(current, previous /*null when async*/) {
	var source = current.getUniqueValue();
	if (current.operation() === "insert")
		updateNavTabs(source, true);	
	
	if (current.operation() === "update")
		updateNavTabs(source, false);
	
	function updateNavTabs(search_source, isInsert) {
		//Check how source was updated
		var nameChanged = isInsert ? true : (current.name != previous.name);
		var sourceChanged = isInsert ? true : (current.datasource != previous.datasource);
		if(!nameChanged && !sourceChanged) return;
		
		//fetch all NavTabs with modified source
		var navTabGr = new GlideRecord('sys_search_filter');
		navTabGr.addQuery('ais_search_source', search_source);
		navTabGr.query();
		
		//Update Names & Labels for each Nav Tab that uses this source
		while (navTabGr.next()) {
			if (nameChanged) 
				navTabGr.setValue('name', current.name);
			if (sourceChanged) {
				var sourceTable = current.datasource.source;
				navTabGr.setValue('label' , (new GlideRecord(sourceTable)).getClassDisplayValue());
			}
			navTabGr.update();
		}
	}

})(current, previous);
