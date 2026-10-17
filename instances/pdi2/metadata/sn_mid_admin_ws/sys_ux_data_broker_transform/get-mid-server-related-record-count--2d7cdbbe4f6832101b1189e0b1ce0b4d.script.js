function transform (input) {
	var result = {};
	for (var id in input.tablesInfo) {
		var ga = new GlideAggregate(input.tablesInfo[id].table); 
		ga.addEncodedQuery(input.tablesInfo[id].query); 
		ga.addAggregate('COUNT');
		ga.query();
	
		var recordCount = 0;
		if (ga.next()) {
			recordCount = ga.getAggregate('COUNT');
		}
		result[id] = recordCount;
	}
	return result;
}
