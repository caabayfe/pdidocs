function transform(input) {
	var tableName = input.tableName;
	if(tableName) {
		var rulesAPI = new sn_data_management_console.RulesAPI(); 
		return JSON.parse(rulesAPI.getRules(tableName, ['TABLE_CLEANER', 'ARCHIVE', 'ONE_TIME_DELETE']));
	}
	return [];
}
