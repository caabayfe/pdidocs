function transform(input) {
	var offset = input.offset;
	if (!offset) {
		offset = 0;
	}
	var limit = input.limit;
	var util = new sn_cmdb_ws.MultisourceUtil();
	var results = util.getAndTransformQueries(offset,limit);
	
	return results;
}
