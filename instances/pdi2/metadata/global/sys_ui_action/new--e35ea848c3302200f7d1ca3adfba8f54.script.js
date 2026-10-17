function newFromRelatedListM2M() {
	var url,
		tableName = g_list.tableName,
		tabTitle = g_list.title,
		collectionParams = [];
	
	if (!g_list.hasOwnProperty("submitValues"))
		return;
	
	for (var prop in g_list.submitValues)
		if (g_list.submitValues.hasOwnProperty(prop))
			collectionParams.push(prop + '=' + g_list.submitValues[prop]);
	console.log(collectionParams);
	
	url = tableName + '.do?sys_id=-1&' + collectionParams.join('&');
	console.log(url);
	openStudioTab(url, tabTitle);
	
	return false;
}
