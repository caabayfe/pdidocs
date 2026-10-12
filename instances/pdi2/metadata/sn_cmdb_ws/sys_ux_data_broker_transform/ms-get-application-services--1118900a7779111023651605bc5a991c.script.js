function transform(input) {
	var util = new sn_cmdb_ws.MultisourceUtil();
	var results = util.getAndTransformApplicationServices();
	
	return results;
}
