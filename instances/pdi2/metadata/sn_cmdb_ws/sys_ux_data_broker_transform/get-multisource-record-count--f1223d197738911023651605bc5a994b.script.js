function transform(input) {
	var result = {
		errors: [],
		table: '',
		value: '',
		count: 0
	};
	
	try {
		var table = input.table;
		var executionId = input.executionId;

		if (!table || !table.length || !table[0]) {
			result.errors.push('Table is missing.');
		}
		if (!executionId || !executionId.length || !executionId[0]) {
			result.errors.push('executionId is missing.');
		}
		
		if (!result.errors.length) {
			result.table = table;
			result.value = executionId;
			var ga = new GlideAggregate(table);
			ga.addEncodedQuery("execution_id.sys_id="+executionId, true);
			ga.query();
			if (ga.next()) {
				var count = parseInt(ga.getRowCount());
				result.count = count;
				
			}
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
