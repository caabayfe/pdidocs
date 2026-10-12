function transform(input) {
	var util = new sn_cmdb_ws.CMDBWsManualCreateCIService();
	var result = util.searchRefTable(input.table, input.searchText, input.searchType, input.encodedQuery, input.searchField, input.max, input.referenceKey);
	return result;
} 
