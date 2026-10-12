// returns true/false if the fields exists or not
function transform(input) {
	var result = {
		errors: [],
		table: '',
		field: '',
		value: '',
		count: 0
	};
	
	try {
		var table = input.table;
		var value = input.value;

		if (!table || !table.length || !table[0]) {
			result.errors.push('Table is missing.');
		}
		if (!value || !value.length || !value[0]) {
			result.errors.push('Value is missing.');
		}
		
		if (!result.errors.length) {
			result.table = table;
			result.value = value;
			var ga = new GlideAggregate(table);
			var displayColumn = getDisplayColumn(table);
			result.field = displayColumn;
			ga.addQuery(displayColumn, value);
			ga.query();
			if (ga.next()) {
				var count = parseInt(ga.getRowCount());
				result.count = count;
				if (count === 1) {
					var gr = new GlideRecord(table);
					gr.addQuery(displayColumn, value);
					gr.query();
					gr.next();
					result.sysid = gr.getUniqueValue();
				}
			}
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
	
	
	function getDisplayColumn(tableName) {
		var gr = new GlideRecord("sys_dictionary");
		gr.addQuery("name", tableName);
		gr.addQuery("display", true);
		gr.query();
		if (gr.next()) {
			if (gr.hasNext()) {
				return undefined; // not unique
			}
			return gr.element.toString();
		}

		var tu = new TableUtils(tableName); 
		var tables = tu.getTables(); 
		var arrayUtil = new ArrayUtil();
		var parentTables = arrayUtil.convertArray(tables);
		if (parentTables.length > 1) {
			var answer = getDisplayColumn(parentTables[1]);
			if (answer) {
				return answer;
			}
		}

		gr = new GlideRecord(tableName);
		gr.initialize();
		if (gr.isValidField("name")) {
			return "name";
		}
		if (gr.isValidField("u_name")) {
			return "u_name";
		}			
		return "sys_id";
	}
}
