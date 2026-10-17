(function process(request, response) {
	// TODO: Validate permissions
	// TODO: include pagination support

	// Get the query parameters
	var queryParams = request.queryParams; 
	var excludedAppId = (queryParams.excludeAppId) ? queryParams.excludeAppId[0] : '';
	var searchType = queryParams.searchType[0];
	var searchFilter = queryParams.searchFilter[0];

	var result = [];
	var startIndex = 1;
	var queryLimit = 25;
	
	if("update_set" == searchType){
		result = findFilesForUpdateSet(excludedAppId, searchFilter);
	} else if ("table" == searchType){
		result = findFilesForTable(excludedAppId, searchFilter);
	} else if ("name" == searchType){
		result = findFilesByName(excludedAppId, searchFilter);
	} else if ("list_app_files" == searchType){
		result = findFilesByApp(searchFilter);
	}
	
	response.setBody({
		count: result.length,
		files: result
	});
	
	response.setStatus(200);
	response.setContentType('application/json');

	function findFilesForUpdateSet(excludedAppId, updateSetSysId) {
		var metadata = sn_gfiles.GlobalApp.getUpdateSetMetadata(updateSetSysId, excludedAppId);
		return formatResults(metadata);
	}
 
	function findFilesForTable(excludedAppId, tableName) {
		var metadata = sn_gfiles.GlobalApp.getTableMetadata(tableName, excludedAppId);
		return formatResults(metadata);
	}
	
	function findFilesByName(excludedAppId, name) {
		var metadata = sn_gfiles.GlobalApp.getNameMetadata(name, excludedAppId);
		return formatResults(metadata);
	}
	
	function findFilesByApp(appId) {
		var metadata = sn_gfiles.GlobalApp.getAppMetadata(appId);
		return formatResults(metadata);
	}
 
	function formatResults(metadata) {
		var records = metadata.getRecords();
		var result = [];
		var i = 0;
		while (i < metadata.getRecordCount()) {
			var record = records[i];
			result.push({
				sysId: record.getSysId() + '',
				type: record.getType() + '',
				name: record.getName() + '',
				updateName: record.getUpdateName() + '',
				appId: record.getApplicationSysId() + '',
				appName: record.getApplicationName() + '',
				updated: record.getUpdated() + '',
				customized: "true" == (record.isCustomized() + '')
			});
			i++;
		}
		return result;
	}
})(request, response);
