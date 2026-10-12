function newFromRelatedList() {
	var url, tableName = g_list.tableName;
	var tabTitle = g_list.title;
	var collectionParams = [];
	collectionParams.push('sysparm_collection=' + g_list.getSubmitValue('sysparm_collection'));
	collectionParams.push('sysparm_collectionID=' + g_list.getSubmitValue('sysparm_collectionID'));
	collectionParams.push('sysparm_collection_relationship=' + g_list.getSubmitValue('sysparm_collection_relationship'));

	if (g_list.view) {
	    collectionParams.push('sysparm_view=' + g_list.view);
	}

	url = tableName + '.do?sys_id=-1&' + collectionParams.join('&');
	openStudioTab(url, tabTitle);
	
	return false;
}
