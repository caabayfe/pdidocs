(function executeRule(current, previous /*null when async*/) {

	//If versioning installed and the article is versioned, cascade the count to later versions.
	var laterVersions = new GlideRecord('kb_knowledge');
	laterVersions.addQuery('article_id',current.article.article_id);
	laterVersions.addQuery('sys_created_on','>',current.article.sys_created_on);
	laterVersions.query();
	while(laterVersions.next()){
		if(current.viewed)
			incrementValue(laterVersions,"sys_view_count");
		if(current.used)
			incrementValue(laterVersions,"use_count");
		laterVersions.setSystem(true);
		laterVersions.setWorkflow(false);
		laterVersions.update();
	}

	function incrementValue(current,fieldName){
		var currentValue = current.getValue(fieldName);
		if(!currentValue)
			currentValue = 0;
		current.setValue(fieldName,parseInt(currentValue)+ 1);
	}

})(current, previous);
