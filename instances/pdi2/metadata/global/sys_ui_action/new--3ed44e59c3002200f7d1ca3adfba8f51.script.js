function newDictionaryEntryFromEmbeddedList() {
	var url, tableName = g_list.tableName;
	var tabTitle = g_list.title;
	var collectionParams = [];
	
	collectionParams.push(gsv('sysparm_collection'));
	collectionParams.push(gsv('sysparm_collectionID'));
	collectionParams.push(gsv('sysparm_collection_relationship'));
	collectionParams.push('sysparm_query_override=name=' + g_form.getValue('name'));
	
	url = tableName + '.do?sys_id=-1&' + collectionParams.join('&');
	openStudioTab(url, tabTitle);
	
	return false;
	
	function gsv(name) {
		return name + '=' + g_list.getSubmitValue(name);
	}
}
