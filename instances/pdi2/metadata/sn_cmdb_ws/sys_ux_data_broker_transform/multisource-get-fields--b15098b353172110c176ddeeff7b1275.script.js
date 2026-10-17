function transform(input) {
	
	var tables = input.tables;
	if (!tables) {
		return null; //throw proper error 
	}

	var util = new sn_cmdb_ws.MultisourceUtil();
	var results = util.getAndTransformColumnsForTables(tables);
	
	return results;
}
