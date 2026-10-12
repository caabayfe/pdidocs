function transform(input) {
	var table = input.table;
	if (!table) {
		return null; //throw proper error
	}

	var util = new sn_cmdb_ws.MultisourceUtil();
	var results = util.getAndTransformColumns(table);
	
	return results;
}
